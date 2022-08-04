import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import moment from "moment-timezone";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import aws from "aws-sdk";
import routes from "./routes";
import Alarm from "./models/Alarm";
import User from "./models/User";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_PRIVATE_KEY,
  region: "ap-northeast-2",
});

// 샘플 이미지 등록
const multerSamplePic = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: "bongbong/test",
    key(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});
// 뉴스 이미지 등록
const multerNewsImgPic = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: "chartin/newsImg",
    key(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});
// 뉴스 summernote 이미지 등록
const multerSummernoteUpload = multer({
  // 이미지 파일이 아니면 짜른다
  fileFilter(_, file, callback) {
    const ext = path.extname(file.originalname);
    const extArr = [".png", ".jpg", ".gif", ".jpeg", ".webp", ".PNG", ".JPG", ".GIF", ".JPEG", ".WEBP"];
    if (!extArr.includes(ext)) {
      return callback(new Error("허용되지 않는 파일형식 저장"));
    }
    callback(null, true);
  },

  storage: multerS3({
    s3,
    bucket: "chartin/summernoteImg",

    // 저장되는 방식 : org/단체 ID/날짜명 group명
    key(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
    acl: "public-read",
  }),
});
// 파트너 로고 이미지 등록
const multerPartnerLogoPic = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: "chartin/partner-logo",
    key(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});
// 영상 썸네일 이미지 등록
const multerVideoThumbnailPic = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: "chartin/video-thumbnail",
    key(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});
// 프로모션 제안 파일첨부
const multerPromotionFilePic = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: `chartin/promotion-file/${Date.now()}`,
    metadata(req, file, cb) {
      cb(null, {
        "Content-Disposition": "attachment",
      });
    },
    key(req, file, cb) {
      cb(null, file.originalname);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});
// 미션 배경이미지 등록
const multerMissionPic = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: "chartin/mission",
    key(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});
// 컨퍼런스 이미지 등록
const multerConferenceFilePic = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: "chartin/conference_file",
    key(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});

// 샘플 이미지 등록
export const uploadSamplePic = multerSamplePic.single("thumbnail");
// 뉴스 이미지 등록
export const uploadNewsImgPic = multerNewsImgPic.single("uploadNewsImg");
// 뉴스 summernote 이미지 등록
export const uploadSummernotePics = multerSummernoteUpload.single("desc");
// 파트너 로고 이미지 등록
export const uploadPartnerLogoPic = multerPartnerLogoPic.single("uploadPartnerLogoImg");
// 영상 썸네일 이미지 등록
export const uploadVideoThumbnailPic = multerVideoThumbnailPic.single("uploadVideoThumbnailImg");
// 프로모션 제안 파일 첨부
export const uploadPromotionFilePic = multerPromotionFilePic.single("uploadPromotionFile");
// 미션 배경이미지 등록
export const uploadMissionPic = multerMissionPic.single("missionImg");
// 컨퍼런스 이미지 등록
export const uploadConferenceFilePic = multerConferenceFilePic.single("uploadConferenceFile");

export const localsMiddleware = async (req, res, next) => {
  res.locals.siteName = "CHARTIN";
  res.locals.routes = routes;
  res.locals.loggedUser = req.user || null;
  res.locals.currentYear = new Date().getFullYear().toString();
  res.locals.currentUrl = req.url;
  res.locals.lang = req.cookies.lang ? "ko" : "en";
  res.locals.mentalDiagnosisLink = "/news-room/detail/620b4c3fa05f05059908c683";
  res.locals.toturialLink = "/news-room/detail/620b4c94a05f05059908c691";
  res.locals.contentPolicy = "/news-room/detail/6207688bb4b5fb77faa38054";
  // 알림 조회
  res.locals.alarms = req.user ? await Alarm.find({ userID: req.user._id }).sort({ createdAt: -1 }).populate("userID") : null;
  res.locals.newAlarmBool = req.user ? await Alarm.find({ userID: req.user._id, read: false }) : null;
  // 배열인지 체크하고 무조건 배열로 리턴하는 함수
  res.locals.absoluteArr = (data) => {
    return Array.isArray(data) ? data : [data];
  };
  // 알림 생성 함수
  res.locals.sendAlarm = async (userID, desc, link) => {
    await Alarm.create({
      userID,
      desc,
      link,
      createdAt: moment(new Date()).tz("Asia/Seoul"),
    });
  };
  // 메일 전송 함수
  // 필요시 greetings 밑에 추가
  // <p style="font-weight: 700; font-size: 20px; margin-top: 0; --text-opacity: 1; color: #10eb73;">${name}</p>
  res.locals.sendEmail = async (email, subject, greetings, desc, linkTitle, link) => {
    const user = await User.findOne({ userID: email });
    if (user && user.emailSubscription) {
      const msg = {
        to: email,
        from: "Info@chartinmusic.com",
        subject,
        html: `
  <div role="article" aria-roledescription="email" aria-label="Welcome to PixInvent 👋" lang="en">
    <table style="font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; width: 100%;' width='100%' cellpadding='0' cellspacing='0' role='presentation">
      <tbody>
        <tr>
          <td align="center" style="--bg-opacity: 1; background-color: #eceff1; background-color: rgba(236, 239, 241, var(--bg-opacity)); font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif;' bgcolor='rgba(236, 239, 241, var(--bg-opacity))">
            <table class="sm-w-full" style="font-family: 'Montserrat',Arial,sans-serif; max-width: 600px;' width='600' cellpadding='0' cellspacing='0' role='presentation">
              <tbody>
                <tr>
                  <td class="sm-px-24" align="center" style="font-family: 'Montserrat',Arial,sans-serif; max-width:500px; ">
                    <table style="font-family: 'Montserrat',Arial,sans-serif; width: 100%;' width='100%' cellpadding='0' cellspacing='0' role='presentation background-color: #16151a;">
                      <tbody>
                        <tr>
                          <td class="sm-px-24" style="background-color: #16151a; --bg-opacity: 1; border-radius: 4px; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; font-size: 14px; line-height: 24px; padding: 48px; text-align: left; --text-opacity: 1; color: #fff; "><a href="https://chartinmusic.com"><img src="https://chartin.s3.ap-northeast-2.amazonaws.com/logo/logo_basic%403x.png" width="155" style="border: 0; max-width: 100%; line-height: 100%; vertical-align: middle; margin-bottom: 30px;"/></a>
                            <p style="font-weight: 600; font-size: 18px; margin-bottom: 0; color: #fff;">${greetings}</p>
                            <p style="margin: 24px 0;">${desc}</p>
                            <a href=${link ? "https://www.chartinmusic.com" + link : ""} style="font-weight: 600; font-size: 18px; margin-bottom: 0; color: #10eb73;">${linkTitle ? linkTitle : ""}</a>
                            <table style="font-family: 'Montserrat',Arial,sans-serif;' cellpadding='0' cellspacing='0' role='presentation">
                              <tbody>
                                <tr>
                                  <td style="mso-padding-alt: 16px 24px; --bg-opacity: 1; background-color: #10eb73; border-radius: 4px; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif;' bgcolor='rgba(115, 103, 240, var(--bg-opacity))"><a href="https://chartinmusic.com" style="display: block; font-weight: 600; font-size: 14px; line-height: 100%; padding: 5px 24px; --text-opacity: 1; color: #ffffff; text-decoration: none; background-color: #10eb73;border-radius: 4px;">CHARTIN →</a></td>
                                </tr>
                              </tbody>
                            </table>
                            <table style="font-family: 'Montserrat',Arial,sans-serif; width: 100%;' width='100%' cellpadding='0' cellspacing='0' role='presentation">
                              <tbody>
                                <tr>
                                  <td style="font-family: 'Montserrat',Arial,sans-serif; padding-top: 32px; padding-bottom: 32px;">
                                    <div style="--bg-opacity: 1; background-color: #eceff1; background-color: rgba(236, 239, 241, var(--bg-opacity)); height: 1px; line-height: 1px;">‌</div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p style="margin: 0 0 16px;">Thanks, <br/>CHARTIN Team</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: 'Montserrat',Arial,sans-serif; height: 20px;' height='20"></td>
                        </tr>
                        <tr style="display: flex; flex-direction: column; justify-content:center; align-items: center">
                          <td style="margin-bottom: 20px; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; font-size: 12px; padding-left: 48px; padding-right: 48px; --text-opacity: 1; color: #eceff1; color: rgba(236, 239, 241, var(--text-opacity));">
                            <p style="--text-opacity: 1; color: #263238; color: rgba(38, 50, 56, var(--text-opacity)); text-align: center;">Use of our service and website is subject to our <a class="hover-underline" href="https://chartinmusic.com/terms-of-use" style="--text-opacity: 1; color: #7367f0; text-decoration: none;">Terms of Use </a>and <a class="hover-underline" href="https://chartinmusic.com/privacy-policy" style="--text-opacity: 1; color: #7367f0; color: rgba(115, 103, 240, var(--text-opacity)); text-decoration: none;">Privacy Policy</a>.</p>
                          </td>
                          <td style="font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; font-size: 12px; padding-left: 48px; padding-right: 48px; --text-opacity: 1; color: #eceff1; color: rgba(236, 239, 241, var(--text-opacity));">
                            <p style="--text-opacity: 1; color: #263238; color: rgba(38, 50, 56, var(--text-opacity)); text-align: center;">Don't you want to subscribe? <a class="hover-underline" href="https://chartinmusic.com/user/sign-in/unsubscribe" style="--text-opacity: 1; color: #7367f0; text-decoration: none;">Unsubscribe</a></p>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: 'Montserrat',Arial,sans-serif; height: 16px;' height='16"></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
        `,
      };
      sgMail.send(msg).then(
        () => {
          // res.json({ msg: "success" });
        },
        (error) => {
          console.log(error);
          res.send(`<script>alert("Failed to send email.");</script>`);
        }
      );
    }
  };
  res.locals.addComma = (number) => {
    const regexp = /\B(?=(\d{3})+(?!\d))/g;
    return number.toString().replace(regexp, ",");
  };
  res.locals.replaceAll = (str, searchStr, replaceStr) => {
    return str.split(searchStr).join(replaceStr);
  };
  // 날짜 형식 변환
  res.locals.dateFormatYMD = (date) => moment(date).tz("Asia/Seoul").format("YYYY-MM-DD");
  res.locals.dateFormatYMDHm = (date) => moment(date).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm");
  res.locals.dateFormatYMDHms = (date) => moment(date).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss");
  res.locals.dateFormatMDY = (date) => moment(date).tz("Asia/Seoul").format("MMM, DD-YYYY");
  res.locals.dateFormatMDY2 = (date) => moment(date).tz("Asia/Seoul").format("MM/DD/YYYY");
  res.locals.dateFormatMDY3 = (date) => moment(date).tz("Asia/Seoul").format("DD MMM YYYY");
  res.locals.dateFormatMDYHm = (date) => moment(date).tz("Asia/Seoul").format("DD MMM YYYY, HH:mm");
  // 배열 Random 섞기
  res.locals.shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  };
  // Gradient Color
  res.locals.gradientColors = [
    { background: "rgb(2,0,36)", backgroundLinear: "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(16,235,115,1) 100%)" },
    { background: "rgb(2,0,36)", backgroundLinear: "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(16,83,235,1) 100%)" },
    { background: "rgb(2,0,36)", backgroundLinear: "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(212,235,16,1) 100%)" },
    { background: "rgb(2,0,36)", backgroundLinear: "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(104,16,235,1) 100%)" },
    { background: "rgb(2,0,36)", backgroundLinear: "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(235,16,234,1) 100%)" },
    { background: "rgb(2,0,36)", backgroundLinear: "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(235,16,105,1) 100%)" },
    { background: "rgb(2,0,36)", backgroundLinear: "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(235,16,16,1) 100%)" },
    { background: "rgb(2,0,36)", backgroundLinear: "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(235,130,16,1) 100%)" },
    { background: "rgb(2,0,36)", backgroundLinear: "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(171,235,16,1) 100%)" },
    { background: "rgb(2,0,36)", backgroundLinear: "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(16,235,222,1) 100%)" },
    { background: "rgb(212,62,21)", backgroundLinear: "linear-gradient(90deg, rgba(212,62,21,1) 0%, rgba(16,235,115,1) 100%)" },
    { background: "rgb(212,126,21)", backgroundLinear: "linear-gradient(90deg, rgba(212,126,21,1) 0%, rgba(16,235,115,1) 100%)" },
    { background: "rgb(212,203,21)", backgroundLinear: "linear-gradient(90deg, rgba(212,203,21,1) 0%, rgba(16,235,115,1) 100%)" },
    { background: "rgb(137,212,21)", backgroundLinear: "linear-gradient(90deg, rgba(137,212,21,1) 0%, rgba(16,235,115,1) 100%)" },
    { background: "rgb(21,102,212)", backgroundLinear: "linear-gradient(90deg, rgba(21,102,212,1) 0%, rgba(16,235,115,1) 100%)" },
    { background: "rgb(75,21,212)", backgroundLinear: "linear-gradient(90deg, rgba(75,21,212,1) 0%, rgba(16,235,115,1) 100%)" },
    { background: "rgb(133,21,212)", backgroundLinear: "linear-gradient(90deg, rgba(133,21,212,1) 0%, rgba(16,235,115,1) 100%)" },
    { background: " rgb(212,21,204)", backgroundLinear: "linear-gradient(90deg, rgba(212,21,204,1) 0%, rgba(16,235,115,1) 100%)" },
    { background: "rgb(212,21,70)", backgroundLinear: "linear-gradient(90deg, rgba(212,21,70,1) 0%, rgba(16,235,115,1) 100%)" },
  ];
  // Register Musician Genre
  res.locals.musicianGenreArr = [
    { id: "1", name: "HipHop" },
    { id: "2", name: "Pop" },
    { id: "3", name: "K-Pop" },
    { id: "4", name: "Alternative" },
    { id: "5", name: "Rock" },
    { id: "6", name: "R&B/Soul" },
    { id: "7", name: "Ballad" },
    { id: "8", name: "EDM" },
    { id: "9", name: "Classic" },
    { id: "10", name: "Others" },
  ];
  // Register Expert Title
  res.locals.expertTitleArr = [
    { id: "1", name: "Playlister" },
    { id: "2", name: "Feedbacker" },
    { id: "3", name: "Promoter" },
    { id: "4", name: "Influencer" },
    { id: "5", name: "Magazine editor​" },
    { id: "6", name: "Record Label CEO/Manager​" },
    { id: "7", name: "A&R​" },
    { id: "8", name: "Producer" },
    { id: "9", name: "Sound engineer" },
    { id: "10", name: "Others" },
  ];
  // Register Expert Providable Services
  res.locals.expertProvidableServicesArr = [
    { id: "1", name: "Search ads" },
    { id: "2", name: "Paid Social - Youtube" },
    { id: "3", name: "Paid Social - Instagram/FB" },
    { id: "4", name: "Paid Social - TikTok" },
    { id: "5", name: "Paid Social - Others" },
    { id: "6", name: "Influencer marketing" },
    { id: "7", name: "Playlist placement" },
    { id: "8", name: "Press release" },
    { id: "9", name: "A&R" },
    { id: "10", name: "Content production" },
    { id: "11", name: "Radio PR" },
    { id: "12", name: "Customized" },
    { id: "13", name: "Mix/Mastering" },
    { id: "14", name: "Feedback" },
  ];
  // Register Expert How experienced are you?
  res.locals.expertExperienceArr = [
    { id: "1", name: "I am officially licensed to run a business" },
    { id: "2", name: "I've worked in the music industry" },
    { id: "3", name: "I have professional knowledge in music or promotion" },
    { id: "4", name: "I am a musician myself" },
    { id: "5", name: "I am a heavy listener" },
    { id: "6", name: "I own one or more playlists" },
    { id: "7", name: "I've produced/mixed/mastered numerous songs" },
  ];
  // Country API
  res.locals.country = [
    { name: "Afghanistan" },
    { name: "Albania" },
    { name: "Algeria" },
    { name: "Andorra" },
    { name: "Angola" },
    { name: "Antigua and Deps" },
    { name: "Argentina" },
    { name: "Armenia" },
    { name: "Australia" },
    { name: "Austria" },
    { name: "Azerbaijan" },
    { name: "Bahamas" },
    { name: "Bahrain" },
    { name: "Bangladesh" },
    { name: "Barbados" },
    { name: "Belarus" },
    { name: "Belgium" },
    { name: "Belize" },
    { name: "Benin" },
    { name: "Bhutan" },
    { name: "Bolivia" },
    { name: "Bosnia Herzegovina" },
    { name: "Botswana" },
    { name: "Brazil" },
    { name: "Brunei" },
    { name: "Bulgaria" },
    { name: "Burkina" },
    { name: "Burundi" },
    { name: "Cambodia" },
    { name: "Cameroon" },
    { name: "Canada" },
    { name: "Cape Verde" },
    { name: "Central African Rep" },
    { name: "Chad" },
    { name: "Chile" },
    { name: "China" },
    { name: "Colombia" },
    { name: "Comoros" },
    { name: "Congo" },
    { name: "Congo {Democratic Rep}" },
    { name: "Costa Rica" },
    { name: "Croatia" },
    { name: "Cuba" },
    { name: "Cyprus" },
    { name: "Czech Republic" },
    { name: "Denmark" },
    { name: "Djibouti" },
    { name: "Dominica" },
    { name: "Dominican Republic" },
    { name: "East Timor" },
    { name: "Ecuador" },
    { name: "Egypt" },
    { name: "El Salvador" },
    { name: "Equatorial Guinea" },
    { name: "Eritrea" },
    { name: "Estonia" },
    { name: "Ethiopia" },
    { name: "Fiji" },
    { name: "Finland" },
    { name: "France" },
    { name: "Gabon" },
    { name: "Gambia" },
    { name: "Georgia" },
    { name: "Germany" },
    { name: "Ghana" },
    { name: "Greece" },
    { name: "Grenada" },
    { name: "Guatemala" },
    { name: "Guinea" },
    { name: "Guinea-Bissau" },
    { name: "Guyana" },
    { name: "Haiti" },
    { name: "Honduras" },
    { name: "Hungary" },
    { name: "Iceland" },
    { name: "India" },
    { name: "Indonesia" },
    { name: "Iran" },
    { name: "Iraq" },
    { name: "Ireland {Republic}" },
    { name: "Israel" },
    { name: "Italy" },
    { name: "Ivory Coast" },
    { name: "Jamaica" },
    { name: "Japan" },
    { name: "Jordan" },
    { name: "Kazakhstan" },
    { name: "Kenya" },
    { name: "Kiribati" },
    { name: "Kosovo" },
    { name: "Kuwait" },
    { name: "Kyrgyzstan" },
    { name: "Laos" },
    { name: "Latvia" },
    { name: "Lebanon" },
    { name: "Lesotho" },
    { name: "Liberia" },
    { name: "Libya" },
    { name: "Liechtenstein" },
    { name: "Lithuania" },
    { name: "Luxembourg" },
    { name: "Macedonia" },
    { name: "Madagascar" },
    { name: "Malawi" },
    { name: "Malaysia" },
    { name: "Maldives" },
    { name: "Mali" },
    { name: "Malta" },
    { name: "Marshall Islands" },
    { name: "Mauritania" },
    { name: "Mauritius" },
    { name: "Mexico" },
    { name: "Micronesia" },
    { name: "Moldova" },
    { name: "Monaco" },
    { name: "Mongolia" },
    { name: "Montenegro" },
    { name: "Morocco" },
    { name: "Mozambique" },
    { name: "Myanmar, {Burma}" },
    { name: "Namibia" },
    { name: "Nauru" },
    { name: "Nepal" },
    { name: "Netherlands" },
    { name: "New Zealand" },
    { name: "Nicaragua" },
    { name: "Niger" },
    { name: "Nigeria" },
    { name: "North Korea" },
    { name: "Norway" },
    { name: "Oman" },
    { name: "Pakistan" },
    { name: "Palau" },
    { name: "Panama" },
    { name: "Papua New Guinea" },
    { name: "Paraguay" },
    { name: "Peru" },
    { name: "Philippines" },
    { name: "Poland" },
    { name: "Portugal" },
    { name: "Qatar" },
    { name: "Romania" },
    { name: "Russian Federation" },
    { name: "Rwanda" },
    { name: "St Kitts and Nevis" },
    { name: "St Lucia" },
    { name: "Saint Vincent and the Grenadines" },
    { name: "Samoa" },
    { name: "San Marino" },
    { name: "Sao Tome and Principe" },
    { name: "Saudi Arabia" },
    { name: "Senegal" },
    { name: "Serbia" },
    { name: "Seychelles" },
    { name: "Sierra Leone" },
    { name: "Singapore" },
    { name: "Slovakia" },
    { name: "Slovenia" },
    { name: "Solomon Islands" },
    { name: "Somalia" },
    { name: "South Africa" },
    { name: "South Korea" },
    { name: "South Sudan" },
    { name: "Spain" },
    { name: "Sri Lanka" },
    { name: "Sudan" },
    { name: "Suriname" },
    { name: "Swaziland" },
    { name: "Sweden" },
    { name: "Switzerland" },
    { name: "Syria" },
    { name: "Taiwan" },
    { name: "Tajikistan" },
    { name: "Tanzania" },
    { name: "Thailand" },
    { name: "Togo" },
    { name: "Tonga" },
    { name: "Trinidad and Tobago" },
    { name: "Tunisia" },
    { name: "Turkey" },
    { name: "Turkmenistan" },
    { name: "Tuvalu" },
    { name: "Uganda" },
    { name: "Ukraine" },
    { name: "United Arab Emirates" },
    { name: "United Kingdom" },
    { name: "United States" },
    { name: "Uruguay" },
    { name: "Uzbekistan" },
    { name: "Vanuatu" },
    { name: "Vatican City" },
    { name: "Venezuela" },
    { name: "Vietnam" },
    { name: "Yemen" },
    { name: "Zambia" },
    { name: "Zimbabwe" },
  ];
  //  Conference Room Category
  res.locals.conferenceCategoryArr = [
    { id: "1", name: "All" },
    { id: "2", name: "Production" },
    { id: "3", name: "Vocals" },
    { id: "4", name: "Promotion" },
    { id: "5", name: "Instrument" },
    { id: "6", name: "Others" },
  ];

  // Kind of Service
  res.locals.serviceArr = [{ type: "Feedback" }, { type: "Promotion" }, { type: "Mix/Master" }];

  // Diagnosis Markets
  res.locals.diagnosisMarkets = [{ name: "Asia" }, { name: "North America" }, { name: "Latin America" }, { name: "Europe" }, { name: "Africa" }, { name: "Australia" }];

  // Diagnosis Budget
  res.locals.diagnosisBudget = [
    { name: "300-500 USD" },
    { name: "500-800 USD" },
    { name: "800-1,000 USD" },
    { name: "1,000-1,500 USD " },
    { name: "1,500-3,000 USD" },
    { name: "More than 3,000 USD​" },
  ];

  // Diagnosis Goal
  res.locals.diagnosisGoal = [
    { name: "More instagram followers" },
    { name: "More spotify listenings" },
    { name: "Setting up live event" },
    { name: "Expanding influence abroad" },
    { name: "Building global fanbase" },
    { name: "Communicating with fans" },
    { name: "Creating contents" },
    { name: "Going viral" },
    { name: "Learn more about branding strategies" },
    { name: "Finding celebrities to work with" },
    { name: "Getting noticed online" },
    { name: "Others" },
  ];

  // Diagnosis Result
  res.locals.feedback = [
    {
      content: `<br /><br />Once you request for a feedback, 3 feedbackers with industry experience will anlayze your music according to your needs. Then you'll be requested to choose 1 best expert to reward.
      <br /><br />Each feedbacker has a unique background. Thus, they will try to give you the best advice and analysis within their areas of expertise.
      <br /><br />You can then take a step forward to promote your music based on the feedback you received! Simply by requesting either Promotion service or Mix/Master service.
      <br /><br />We know you've struggled a lot, but now is time to better your life and better your music.
      <br /><br />Let's get higher.
      `,
    },
  ];
  res.locals.mixMaster = [
    {
      content: `<br /><br />Once you request for a mix/master service, you'll receive multiple proposals from our sound engineers and get to choose 'the best' expert to work with.
        <br /><br />After the match, Expert will analyze your music files with their expertise and work to produce the best output.
        <br />You can deliver your original raw files (mp3,wav..) on our chat through dropbox link.
        <br /><br />You can then take a step forward to promote your masterpiece music.
        <br />Simply by requesting either Promotion or Feedback Service.
        <br /><br />We know you've struggled a lot. Now is time to better your life and better your music.
        <br /><br />Let's get higher.`,
    },
  ];
  res.locals.promotionIntro = [
    // 프로모션 인사 3가지
    {
      content: [
        { firstIntro: "Hello beautiful CHART WINNER,<br />Welcome again.<br /><br />" },
        { secondIntro: "Good morning, afternoon, or night depending on where you are.<br />Welcome again.<br /><br />" },
        { thirdIntro: "Hello, CHART WINNER<br />Good to see you striving to promote your wonderful music.<br /><br />" },
      ],
    },
  ];
  res.locals.promotionMarketing = [
    // 프로모션 마케팅 3가지(500이하, 500~1000, 1000이상)
    // 500이하
    {
      firstHipHop: `Playlist placement on Spotify, Youtube, Apple music and international streaming platforms
    <br /><br />2. Tiktok and Instagram Paid ads.
    <br /><br />3. Team-up with Influencer.
    <br /><br />4. Team -up with experts for personalised/tailored promotion.<br /><br />`,
    },
  ];
  res.locals.promotionMarketingSecond = [
    // 500~1000
    {
      first: `1. Story and Content creation on TikTok and Youtube - People will want to hear your "S T O R Y". Building your own narrative will enable you to attract more loyal fans. Let's create your unique narrative and shout it out to the world.<br /><br />`,
    },
    { second: ` Playlist placement on Spotify, Youtube, Apple music and international streaming platforms.<br /><br />` },
    { third: `3. Tiktok and Instagram paid ads.<br /><br />` },
    { fourth: `4. Team-up with Influencer.<br /><br />` },
    { fifth: `5. Team-up with experts for personalised/tailored promotion.<br /><br />` },
  ];
  res.locals.promotionMarketingThird = [
    {
      first: `1. Story and Content creation on TikTok and Youtube - People will want to hear your "S T O R Y". Building your own narrative will enable you to attract more loyal fans. Let's create your unique narrative and shout it out to the world.<br /><br />`,
    },
    { second: ` Playlist placement on Spotify, Youtube, Apple music and international streaming platforms<br /><br />` },
    {
      third: [
        { one: `3. Media exposure over Music magazine, Digital press and Blogs - Get exposed and distributed on the digital world so that your future fans will find you and your music.<br /><br />` },
        {
          two: `3. Media exposure over Music magazine, Digital press and Blogs - Get exposed and exposed on digital world so that your future fans will find you and your music<br /><br />`,
        },
        { three: `3. Media exposure over Music magazine, Digital press and Blogs - Get exposed and exposed to the digital world so that your future fans will find you and your music.<br /><br />` },
      ],
    },
    { fourth: `4. Tiktok and Instagram paid ads - Your music content will be shown to millions of your potential fans of these platforms.<br /><br />` },
    {
      fifth: [
        { one: `5. Team-up with Influencer.<br /><br />` },
        { two: `5. Content creation with influencers who's focusing on lifestyle and classic content - They will help you tell your story and promote your music to the public<br /><br />` },
      ],
    },
    { sixth: `6. Team-up with experts for personalised/tailored promotion.<br /><br />` },
  ];
  res.locals.promotionVideoLink = [
    {
      firstVideoLink: [
        {
          existence: `Also, because you have music video (or music contents) to entertain your fans,<br />you can work with social media and influencers through platforms TikTok and Youtube.<br /><br />We cannot stress enough the importance of content creation. Number one rule in our market is 'no contents, no fame.' <br /><br />We hand-picked our experts and thoroughly verified them to make sure they are commited to music industry and musicians like you.<br /><br />Hope you find your experts to further your music career.<br /><br />They are always one click away - click the CHART IN button below.<br /><br />Let's get higher! `,
          none: `Also, because you DO NOT have any music video (or music contents) to entertain your prospecting fans,<br />it must've been very difficult for you to interact with your fans on a regular basis.<br /><br />We feel your pain. Especially because number one rule in the industry nowadays is 'no contents, no fame.'<br /><br />So, create a music video and video contents to take the first step on social media and go make your fans in and out.<br /><br />We hand-picked our experts and thoroughly verified them to make sure they are commited to music industry and musicians like you.<br /><br />Hope you find your experts to further your music career.<br /><br />They are always one click away - click the CHART IN button below.<br /><br />Let's get higher! `,
        },
      ],
    },
    {
      secondVideoLink: [
        {
          existence: `By the way, good to hear that you have your music video ready.<br /><br />Music Video is number one factor in deciding whether you are ready for social promotion or not.<br /><br />Especially if you're looking forward Youtube promotion.<br /><br />Now, the question is how you will utilize your music video. It's of no use if you can't use it the right way.<br /><br />Here in CHARTIN, we have verified experts who can help you best promote your music video to your needs.<br /><br />They are just one click away thanks to advancement of technology.<br /><br />Let's go get em!`,
          none: `It's unfortunate that you don't have your music video ready.<br /><br />But no worries. You can always find yourself an expert who can guide you through the process of making one.<br /><br />Why make one? Well, music video is number one factor in deciding whether you are ready for social promotion or not.<br /><br />And social promotion is something that needs to be done in order for you to present your music to wider digital audience.<br /><br />Now, let's hire and create videos.<br /><br />We believe in you!`,
        },
      ],
    },
    {
      thirdVideoLink: [
        {
          existence: `You've indicated that you have music video/music content. We're proud of you.<br /><br />Music Video is extremely important in today's music industry.<br /><br />Now, the question is how you will utilize your music video/content. It's of no use if you can't use it the right way.<br /><br />Here in CHARTIN, we have verified experts who can help you best promote your music video to your needs.<br /><br />They are just one click away thanks to advancement of technology.<br /><br />Let's go get em! `,
          none: `You've indicated that you don't have music video or music content.<br /><br />To be completely honest, music with no video content tends to score low performance in almost all methods.<br /><br />So It's unfortunate that you don't have your music video ready.<br /><br />But no worries. You can always find yourself an expert who can guide you through the process of making one.<br /><br />Why make one? Well, music video is number one factor in deciding whether you are ready for social promotion or not.<br /><br />And social promotion is something that needs to be done in order for you to present your music to wider digital audience.<br /><br />Now, let's hire and create videos.<br /><br />We believe in you! `,
        },
      ],
    },
  ];

  // propsal
  // 제안 기간
  res.locals.serviceDuration = [
    { period: "Less than 1 week" },
    { period: "A couple of weeks" },
    { period: "1 month" },
    { period: "2 - 5 months" },
    { period: "Half a year" },
    { period: "1 year" },
    { period: "Others" },
  ];
  res.locals.kindOfPromotion = [
    { name: "Search ads - I can make musician's name appear on top of search engines like Google when people search related keywords." },
    { name: "Paid Social  (Youtube) - I can make musician's content appear on Youtube feed when people watch related videos." },
    { name: "Paid Social (Instagram/FB) - I can promote musician's content on Instagram and Facebook targetting related groups." },
    { name: "Paid Social (TikTok) - I can design and promote Tiktok videos that can go viral for musicians." },
    { name: "Influencer marketing - I can contact and make deals with influencers who can help musician become popular." },
    { name: "Playlist placement - I can place musician's music on popular music playlists to promote and drive new listeners." },
    { name: "Press release - I can draft and distribute press release to magazines and news that global music lovers read." },
    { name: "A&R - I can rearrange musician's concept and set a proper image for their next album." },
    { name: "Content production - I can help musician create new contents." },
    { name: "Radio PR - I can place musician's music on radio." },
    { name: "Mix/Master - I can mix/master musician's music." },
    { name: "Others" },
  ];
  // 피드백 선택지
  res.locals.bestFits = [
    { name: "Search ads - Let your name appear on the top of the list when people search related topics on search engines like Google." },
    { name: "Paid Social  (Youtube) - Let your content appear on people's Youtube feed." },
    { name: "Paid Social (Instagram/FB) - Promote your content on Instagram or Facebook." },
    { name: "Paid Social (TikTok) - Your song should definitely show up on Tiktok for dance or music challenge." },
    { name: "Influencer marketing - Popular influencers online can help you to become popular by introducing your music to their followers." },
    { name: "Playlist placement - Youtube music, Spotify, Deezer and other local streaming platfroms are very effective in promoting music to new listeners." },
    { name: "Press release - You should be introduced in magazines and press that global music lovers read. (not limited to music magazine)" },
    { name: "A&R - You should renovate/reconsider concept and branding. Please go find A&R and set a proper musician branding for next albums and get a concert opportunity." },
    { name: "Content production - Due to the lack of contents, nothing really helps at the moment. I want you to create more contents and promote and get exposed." },
    { name: "Radio PR - People cannot live without a radio nowadays. This could be very good opportunity to promote your music." },
    { name: "Mix/Master - Your music needs Mix/Master done again. It'll increases the song's quality." },
    { name: "Others" },
  ];

  // Get Higher 미션 카테고리
  res.locals.missionCategories = [
    { id: "1", name: "Skill-up" },
    { id: "2", name: "Promotion" },
    { id: "3", name: "Goal Setting" },
    { id: "4", name: "Fan" },
    { id: "5", name: "Mental" },
  ];

  // 결과물 업로드 promotion type
  res.locals.promotionResultTypeArr = [
    { id: "1", name: "Search ads" },
    { id: "2", name: "Paid Social" },
    { id: "3", name: "Influencer marketing" },
    { id: "4", name: "Playlist placement" },
    { id: "5", name: "Press release" },
    { id: "6", name: "A&R" },
    { id: "7", name: "Content production" },
    { id: "8", name: "Radio PR" },
    { id: "9", name: "Others" },
  ];

  res.locals.channels = [
    { id: "a", name: "Google" },
    { id: "b", name: "Naver" },
    { id: "c", name: "Youtube" },
    { id: "d", name: "IG/FB" },
    { id: "e", name: "TikTok" },
    { id: "f", name: "Magazine" },
    { id: "g", name: "Management" },
    { id: "h", name: "Global Radio" },
    { id: "i", name: "Local Radio" },
    { id: "j", name: "Others" },
  ];

  // 결과물 업로드 mixmaster type
  res.locals.mixmasterResultTypeArr = [
    { id: "1", name: "Mixing" },
    { id: "2", name: "Mastering" },
    { id: "3", name: "Mix/Master" },
  ];
  // 랜덤 이미지 URL
  res.locals.randomImg = "https://source.unsplash.com/random";
  // 이미지 파일 경로
  res.locals.imgPath = "/images";
  // 캐시 삭제 방지용 Date Query
  res.locals.versionDateQuery = new Date().getTime();
  // news region
  res.locals.newsRegion = [{ region: "World" }, { region: "Asia" }, { region: "Europe" }, { region: "America" }];

  // 피드백 리퀘스트
  res.locals.feedbackConcept = [{ name: "Single Song (leave a link below)" }, { name: "In general" }];
  res.locals.feedbackBudget = [
    { name: "0 USD, only looking for feedback" },
    { name: "300-500 USD" },
    { name: "500-800 USD" },
    { name: "800-1,000 USD" },
    { name: "1,000-1,500 USD " },
    { name: "1,500-3,000 USD" },
    { name: "More than 3,000 USD​" },
  ];
  next();
};

// --- 접근 권한 설정 ---
// 비회원만 접근 가능
export const onlyPublic = (req, res, next) => {
  try {
    if (req.user) {
      res.send(
        `<script>alert("Invalid access route."); \
        location.href="${routes.home}"</script>`
      );
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred."); \
      location.href="${routes.home}"</script>`
    );
  }
};
// 회원만 접근 가능
export const onlyUser = (req, res, next) => {
  try {
    if (req.user) {
      next();
    } else {
      res.send(
        `<script>alert("You need to sign in to access this page"); \
        location.href="${routes.user}${routes.signIn}"</script>`
      );
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred."); \
      location.href="${routes.home}"</script>`
    );
  }
};
// 뮤지션 회원만 접근 가능
export const onlyMusician = (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.role === "musician") {
        next();
      } else {
        res.send(
          `<script>alert("You need to sign in as musician."); \
          location.href="${routes.home}"</script>`
        );
      }
    } else {
      res.send(
        `<script>alert("You need to sign in to access this page"); \
        location.href="${routes.user}${routes.signIn}"</script>`
      );
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred."); \
      location.href="${routes.home}"</script>`
    );
  }
};
// 전문가 회원만 접근 가능
export const onlyExpert = (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.role === "expert") {
        next();
      } else {
        res.send(
          `<script>alert("You need to sign in as expert."); \
          location.href="${routes.home}"</script>`
        );
      }
    } else {
      res.send(
        `<script>alert("You need to sign in to access this page"); \
        location.href="${routes.user}${routes.signIn}"</script>`
      );
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred."); \
      location.href="${routes.home}"</script>`
    );
  }
};
// 관리자만 접근 가능
export const onlyAdmin = (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.role === "master" || req.user.role === "admin") {
        next();
      } else {
        res.send(
          `<script>alert("You need administrator permissions."); \
          location.href="${routes.home}"</script>`
        );
      }
    } else {
      res.send(
        `<script>alert("You need to sign in as admin."); \
        location.href="${routes.admin}"</script>`
      );
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred."); \
      location.href="${routes.home}"</script>`
    );
  }
};
// 이메일 구독 취소 클릭 후 기존 로그인상태일때
export const checkUserLogged = async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user.emailSubscription) {
        await User.findByIdAndUpdate(req.user._id, { emailSubscription: false });
        res.send(
          `<script>alert("Successfully unsubscribed."); \
          location.href="${routes.home}"</script>`
        );
      } else {
        res.send(
          `<script>alert("You already unsubscribed."); \
          location.href="${routes.home}"</script>`
        );
      }
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred."); \
      location.href="${routes.home}"</script>`
    );
  }
};
