import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import crypto from "crypto";
import moment from "moment-timezone";
import fasterpay from "fasterpay-node";
import passport from "passport";
import routes from "../routes";
import User from "../models/User";
import Purchase from "../models/Purchase";
import Diagnosis from "../models/Diagnosis";
import Like from "../models/Like";
import Mission from "../models/Mission";
import Chat from "../models/Chat";
import Review from "../models/Review";
import Feedback from "../models/Feedback";
import Promotion from "../models/Promotion";
import MixMaster from "../models/MixMaster";
import Proposal from "../models/Proposal";
import Offer from "../models/Offer";
import Conference from "../models/Conference";
import ConferenceLike from "../models/ConferenceLike";
import Comment from "../models/Comment";
import MainVideo from "../models/MainVideo";
import MostVideo from "../models/MostVideo";
import Alarm from "../models/Alarm";
import Recomment from "../models/Recomment";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const gateway = new fasterpay.Gateway({
  publicKey: process.env.FASTER_PAY_PUBLIC_KEY,
  privateKey: process.env.FASTER_PAY_PRIVATE_KEY,
});

// 로그인
export const getSignIn = (req, res) => {
  try {
    res.render("users/signIn");
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postSignIn = (req, res, next) => {
  try {
    passport.authenticate("local", (err, user) => {
      if (user) {
        if (user.role === "musicianAwait" || user.role === "expertAwait") {
          res.send(
            `<script>alert("CHARTIN takes approval process very seriously in order to secure quality of services. Please wait for the approval. Thank you for the patience."); \
            location.href="${routes.home}"</script>`
          );
        } else {
          if (user.firstSignIn) {
            req.logIn(user, async () => {
              res.send(`<script>location.href="${routes.user}${routes.register}/${user.role}/welcome"</script>`);
            });
          } else {
            req.logIn(user, async () => {
              res.send(`<script>location.href="${routes.home}"</script>`);
            });
          }
        }
      } else {
        res.send(
          `<script>alert("Check your login ID or password again."); \
          location.href="${routes.user}${routes.signIn}"</script>`
        );
      }
    })(req, res, next);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 이메일 구독 취소
export const getSignInUnsubscribe = (req, res) => {
  try {
    res.render("users/signIn");
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postSignInUnsubscribe = (req, res, next) => {
  try {
    passport.authenticate("local", async (err, user) => {
      if (user) {
        await User.findByIdAndUpdate(user._id, { emailSubscription: false });
        req.logIn(user, async () => {
          res.send(`<script>location.href="${routes.home}"</script>`);
        });
      } else {
        res.send(
          `<script>alert("Check your login ID or password again."); \
          location.href="${routes.user}${routes.signIn}"</script>`
        );
      }
    })(req, res, next);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 로그아웃
export const getSignOut = (req, res) => {
  try {
    req.logout();
    req.session.destroy(() => {
      res.send(`<script>location.href="${routes.home}"</script>`);
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 회원가입
export const getRegister = (req, res) => {
  try {
    res.render("users/register");
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// 뮤지션 회원가입
export const getMusicianRegister = (req, res) => {
  try {
    res.render("users/registerForm", { type: "musician" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postMusicianRegister = async (req, res) => {
  try {
    const { body } = req;

    const socialArr = [
      { rawName: "socialFacebook", name: "facebook" },
      { rawName: "socialInstagram", name: "instagram" },
      { rawName: "socialTiktok", name: "tiktok" },
      { rawName: "socialYoutube", name: "youtube" },
      { rawName: "socialSpotify", name: "spotify" },
      { rawName: "socialWebsite", name: "website" },
    ];
    socialArr.forEach((x) => {
      body[x.rawName].forEach((y) => {
        if (y !== "") {
          body[x.name] = y;
          return false;
        }
      });
    });
    body.targetCountry = Array.isArray(body.targetCountry) ? body.targetCountry : [body.targetCountry];
    body.createdAt = moment(new Date()).tz("Asia/Seoul");
    body.role = "musicianAwait";
    body.youtubeMusicVideo = body.youtubeMusicVideo && body.youtubeMusicVideo.includes("youtu.be") ? body.youtubeMusicVideo.split("youtu.be/")[1] : body.youtubeMusicVideo && body.youtubeMusicVideo.includes("youtube") ? body.youtubeMusicVideo.split("watch?v=")[1] : "";

    const userInfo = await User(body);
    await User.register(userInfo, body.password);

    const user = await User.findOne({ userID: body.userID });
    // 회원가입 완료 바로 후 (승인되기 전)
    const alarmDesc = `We will take a careful look at your bio/portfolio and let you know when you're approved. Thank you for your patience.`;
    const alarmNewsroomLink = `${routes.newsRoom}/detail/621e1055bb4d4c5208ff5c10`;
    res.locals.sendAlarm(user._id, alarmDesc, alarmNewsroomLink);

    // 회원가입 완료 직후 이메일발송
    const subject = `Welcome to the CHARTIN. Now, here's what you can expect.`;
    const greetings = `Welcome to the CHARTIN.`;
    const desc = `
    You've officially completed the 1st stage of our audition process. We take screening very seriously in order to maintain the qualities of services.\r\n

    We will take a careful look at your bio/portfolio and let you know when you're approved.\r\n

    In the meanwhile, feel free to take a look around our newsroom where we've gathered useful information for both musicians and experts.\r\n

    Thank you for your patience.
    `;
    res.locals.sendEmail(user.userID, subject, greetings, desc);

    res.send(`<script>alert("CHARTIN takes approval process very seriously in order to secure quality of services. Please wait for the approval. Thank you for the patience.");\
      location.href="${routes.user}${routes.register}/musician/description"</script>`);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const getMusicianRegisterDescription = (req, res) => {
  try {
    res.render("users/registerWelcome", { type: "musician", pageName: "description" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const getMusicianRegisterWelcome = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { firstSignIn: false });
    res.render("users/registerWelcome", { type: "musician" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// 전문가 회원가입
export const getExpertRegister = (req, res) => {
  try {
    res.render("users/registerForm", { type: "expert" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postExpertRegister = async (req, res) => {
  try {
    const { body } = req;

    const socialArr = [
      { rawName: "socialFacebook", name: "facebook" },
      { rawName: "socialInstagram", name: "instagram" },
      { rawName: "socialTiktok", name: "tiktok" },
      { rawName: "socialYoutube", name: "youtube" },
      { rawName: "socialSpotify", name: "spotify" },
      { rawName: "socialWebsite", name: "website" },
    ];
    socialArr.forEach((x) => {
      body[x.rawName].forEach((y) => {
        if (y !== "") {
          body[x.name] = y;
          return false;
        }
      });
    });
    body.serviceCountry = Array.isArray(body.serviceCountry) ? body.serviceCountry : [body.serviceCountry];
    body.providableServices = Array.isArray(body.providableServices) ? body.providableServices : [body.providableServices];
    body.createdAt = moment(new Date()).tz("Asia/Seoul");
    body.role = "expertAwait";
    body.averageRate = 0;

    const userInfo = await User(body);
    await User.register(userInfo, body.password);

    const user = await User.findOne({ userID: body.userID });
    // 회원가입 완료 바로 후 (승인되기 전)
    const alarmDesc = `We take screening very seriously in order to maintain the qualities of services. We will take a careful look at your bio/portfolio and let you know when you're approved. Thank you for your patience. `;
    const alarmNewsroomLink = `${routes.newsRoom}/detail/621e1096bb4d4c5208ff5c20`;
    res.locals.sendAlarm(user._id, alarmDesc, alarmNewsroomLink);

    // 회원가입 완료 직후 이메일발송
    const subject = `Welcome to the CHARTIN. Now, here's what you can expect.`;
    const greetings = `Welcome to the CHARTIN.`;
    const desc = `
  You've officially completed the 1st stage of our audition process. We take screening very seriously in order to maintain the qualities of services.\r\n

  We will take a careful look at your bio/portfolio and let you know when you're approved.\r\n

  In the meanwhile, feel free to take a look around our newsroom where we've gathered useful information for both musicians and experts.\r\n

  Thank you for your patience.
  `;
    res.locals.sendEmail(user.userID, subject, greetings, desc);

    res.send(`<script>alert("CHARTIN takes approval process very seriously in order to secure quality of services. Please wait for the approval. Thank you for the patience.");\
      location.href="${routes.user}${routes.register}/expert/description"</script>`);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const getExpertRegisterDescription = (req, res) => {
  try {
    res.render("users/registerWelcome", { type: "expert", pageName: "description" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const getExpertRegisterWelcome = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { firstSignIn: false });
    res.render("users/registerWelcome", { type: "expert" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// **** 뮤지션 전용 페이지 ****
// 뮤지션 - Get Higher
export const getGetHigher = async (req, res) => {
  try {
    const {
      query: { purchase },
    } = req;
    const users = await User.findById(req.user._id).populate("missions.missionID");
    const { subscription } = users;
    const missions = await Mission.find().sort({ createdAt: 1 });
    let activeSlideIndex = 0;
    let setTimer = "48:00:00";
    let timerStatus = "stopped";

    if (users.missions.length !== 0) {
      // 해당 유저의 미션 데이터가 있을 경우 status, start 동기화
      missions.forEach((x, i) => {
        if (users.missions) {
          users.missions.forEach((y) => {
            if (y.missionID._id.toString() === x._id.toString()) {
              x.status = y.status;
              x.start = y.start;
            }
            if (x.status === "doing") {
              // 진행 중인 미션의 슬라이드를 active 하기 위한 index 값 세팅
              activeSlideIndex = i;
              // 진행 중인 미션의 타이머 셋업
              const now = moment(new Date());
              const totalTimeInSec = moment.duration(moment(x.start).add(2, "days").diff(now)).asSeconds();
              if (totalTimeInSec < 0) {
                // 카운트다운이 끝났을 경우
                x.status = "restart";
                setTimer = "00:00:00";
                timerStatus = "stopped";
              } else {
                function seconds_to_hhmmss(numberOfSeconds) {
                  //create duration object from moment.duration
                  var duration = moment.duration(numberOfSeconds, "seconds");

                  //calculate hours
                  const hours = duration.years() * (365 * 24) + duration.months() * (30 * 24) + duration.days() * 24 + duration.hours();
                  var hh = hours < 10 ? `0${hours}` : hours;

                  //get minutes
                  const minutes = duration.minutes();
                  var mm = minutes < 10 ? `0${minutes}` : minutes;

                  // get seconds
                  const seconds = duration.seconds();
                  var ss = seconds < 10 ? `0${seconds}` : seconds;

                  //return total time in hh:mm format
                  return hh + ":" + mm + ":" + ss;
                }
                setTimer = seconds_to_hhmmss(totalTimeInSec);
                timerStatus = "running";
              }
            }
          });
          // 해당 미션의 status가 비어있고, 직전 미션의 status가 complete이라면 시작 가능한 상태인 start로 만들어주기
          if (!missions[i].status && missions[i - 1].status === "complete") {
            missions[i].status = "start";
            // 시작 가능한 미션의 슬라이드를 active 하기 위한 index 값 세팅
            activeSlideIndex = i;
          }
        }
      });
    } else {
      // 해당 유저의 미션 데이터가 없을 경우 첫번째 미션을 start로 세팅
      missions[0].status = "start";
      activeSlideIndex = 0;
    }

    missions.forEach((x) => {
      console.log(x.category);
      switch (x.category) {
        case "1":
          x.color = "#fc57f2";
          break;
        case "2":
          x.color = "#2beb73";
          break;
        case "3":
          x.color = "#256df1";
          break;
        case "4":
          x.color = "#eb9f10";
          break;
        case "5":
          x.color = "#bb6df0";
          break;
        default:
          x.color = "#fc57f2";
      }
    });

    res.render("users/getHigher", { subscription, purchase, missions, activeSlideIndex, setTimer, timerStatus });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// 뮤지션 - 구독 결제 페이지
export const getSubscribePurchase = async (req, res) => {
  try {
    const users = await User.findById(req.user._id);

    if (users.subscription) {
      // 이미 구독 중이라면 Get Higher 페이지로 이동
      res.send(`<script>location.href="${routes.user}${routes.getHigher}"</script>`);
    } else {
      const today = moment(new Date()).tz("Asia/Seoul");
      const merchant_order_id = new Date().getTime().toString();

      // Pre-Purchase 생성
      const purchases = await Purchase.create({
        type: "subscribe",
        status: "pre",
        musicianID: req.user._id,
        description: "Payment Premium Membership",
        amount: "10.99",
        currency: "USD",
        merchant_order_id,
        createdAt: today,
        updatedAt: today,
      });

      // Faster Pay 결제 폼 생성 로직
      const purchaseForm = gateway.PaymentForm().buildForm(
        {
          description: "Payment Premium Membership",
          amount: "10.99",
          currency: "USD",
          merchant_order_id,
          sign_version: "v1",
          recurring_name: "CHARTIN Premium Membership",
          recurring_sku_id: "CHARTIN Premium Membership",
          recurring_period: "1m",
          recurring_duration: "0",
          success_url: `https://chartinmusic.com/api/purchase/success?page=subscribe`,
          pingback_url: `https://chartinmusic.com/api/purchase/pingback?purchaseID=${purchases._id}`,
        },
        {
          autoSubmit: false,
          hidePayButton: false,
        }
      );

      res.render("users/subscribePurchase", { purchases, purchaseForm });
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// 뮤지션 - Service Diagnosis
export const getServiceDiagnosis = (req, res) => {
  try {
    res.render("users/serviceDiagnosis");
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postServiceDiagnosis = async (req, res) => {
  try {
    const { body } = req;

    const result = body;
    let randomNum = 0;
    if (Array.isArray(body.goal)) {
      body.goal = body.goal.filter(function (item) {
        return item !== "Others";
      });
      body.goal.join(", ");
    } else {
      body.goal = body.goal;
    }

    if (result.service === "Promotion") {
      // randomNum += Math.floor(Math.random() * (3 - 1 + 1)) + 1;
      randomNum = 2;
    }
    const diagnoses = await Diagnosis.create({
      result,
      randomNum,
      createdAt: moment(new Date()).tz("Asia/Seoul"),
    });
    res.send(`<script>location.href="${routes.user}${routes.serviceDiagnosis}/result/${diagnoses._id}"</script>`);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// 뮤지션 - Service Diagnosis Result
export const getServiceDiagnosisResult = async (req, res) => {
  try {
    const {
      params: { diagnosisID },
      query: { purchase },
    } = req;

    const today = moment(new Date()).tz("Asia/Seoul");
    const merchant_order_id = new Date().getTime().toString();
    const diagnoses = await Diagnosis.findById(diagnosisID);

    let purchases;
    let purchaseForm;

    if (purchase !== "success") {
      // Pre-Purchase 생성
      purchases = await Purchase.create({
        type: "feedback",
        status: "pre",
        musicianID: req.user._id,
        description: "Pay(Feedback)",
        amount: "30",
        currency: "USD",
        merchant_order_id,
        createdAt: today,
        updatedAt: today,
      });

      // Faster Pay 결제 폼 생성 로직
      purchaseForm = gateway.PaymentForm().buildForm(
        {
          description: "Pay(Feedback)",
          amount: "30",
          currency: "USD",
          merchant_order_id,
          sign_version: "v1",
          success_url: `https://chartinmusic.com/api/purchase/success?diagnosis=${diagnoses._id}`,
          pingback_url: `https://chartinmusic.com/api/purchase/pingback?purchaseID=${purchases._id}`,
        },
        {
          autoSubmit: false,
          hidePayButton: false,
        }
      );
    }

    res.render("users/serviceDiagnosisResult", { purchase, diagnoses, purchases, purchaseForm });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// 뮤지션 - Service Request
export const getServiceRequest = async (req, res) => {
  try {
    const {
      query: { purchase },
    } = req;
    const today = moment(new Date()).tz("Asia/Seoul");
    const merchant_order_id = new Date().getTime().toString();

    let purchases;
    let purchaseForm;

    if (purchase !== "success") {
      // Pre-Purchase 생성
      purchases = await Purchase.create({
        type: "feedback",
        status: "pre",
        musicianID: req.user._id,
        description: "Pay(Feedback)",
        amount: "30",
        currency: "USD",
        merchant_order_id,
        createdAt: today,
        updatedAt: today,
      });

      // Faster Pay 결제 폼 생성 로직
      purchaseForm = gateway.PaymentForm().buildForm(
        {
          description: "Pay(Feedback)",
          amount: "30",
          currency: "USD",
          merchant_order_id,
          sign_version: "v1",
          success_url: `https://chartinmusic.com/api/purchase/success?page=request`,
          pingback_url: `https://chartinmusic.com/api/purchase/pingback?purchaseID=${purchases._id}`,
        },
        {
          autoSubmit: false,
          hidePayButton: false,
        }
      );
    }

    res.render("users/serviceRequest", { purchase, purchases, purchaseForm });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// 뮤지션 - Direct Service Request
export const getDirectServiceRequest = async (req, res) => {
  try {
    const {
      params: { expertID },
    } = req;

    const expert = await User.findById(expertID);
    const serviceType = "direct";

    res.render("users/serviceRequest", { expert, serviceType });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// **** 뮤지션 / 전문가 공통 페이지 ****
// My Favorite [공통 pug 사용]
export const getMyFavorite = async (req, res) => {
  try {
    const likes = await Like.find({ fromUser: req.user._id }).populate([{ path: "toUser", model: "User" }]);

    res.render("users/myFavorite", { likes });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// Chat 대화 중인 채팅이 있는지 확인
export const getCheckChat = async (req, res) => {
  try {
    const {
      params: { musicianID, expertID },
    } = req;
    const chats = await Chat.findOne({ musicianID, expertID }).populate([
      {
        path: "musicianID",
        model: "User",
      },
      {
        path: "expertID",
        model: "User",
      },
    ]);
    if (chats) {
      // 대화 중인 채팅이 있을 경우
      res.send(`<script>location.href="${routes.user}${routes.chat}/detail/${chats._id}"</script>`);
    } else {
      // 대화 중인 채팅이 없을 경우
      const newChats = await Chat.create({
        musicianID,
        expertID,
        createdAt: moment(new Date()).tz("Asia/Seoul"),
      });
      res.send(`<script>location.href="${routes.user}${routes.chat}/detail/${newChats._id}"</script>`);
      // 알림 생성
      const alarmDesc = "New messages arrived in your studio.";
      if (req.user._id.toString() === musicianID) {
        res.locals.sendAlarm(expertID, alarmDesc);
      } else {
        res.locals.sendAlarm(musicianID, alarmDesc);
      }
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// Chat 대화 상세 페이지
export const getChatDetail = async (req, res) => {
  try {
    const {
      params: { chatID },
    } = req;
    const chats = await Chat.findById(chatID).populate([
      {
        path: "musicianID",
        model: "User",
      },
      {
        path: "expertID",
        model: "User",
      },
    ]);

    if (req.user.role === "musician") {
      // 뮤지션이면 mUnread 값 0으로 초기화
      await Chat.findByIdAndUpdate(chatID, { mUnread: 0 });
    } else if (req.user.role === "expert") {
      // 전문가이면 eUnread 값 0으로 초기화
      await Chat.findByIdAndUpdate(chatID, { eUnread: 0 });
    }
    if (chats) {
      res.render("users/chatDetail", { chats });
    } else {
      res.send(
        `<script>alert("This chat has already been deleted.");\
        location.href="/user-${req.user.role}${routes.chat}"</script>`
      );
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// 회원탈퇴
export const getLeaveMembership = async (req, res) => {
  try {
    const {
      params: { userID },
    } = req;

    if (req.user.role === "musician") {
      // 뮤지션 탈퇴 => userID = musicianID
      // 탈퇴할 뮤지션이 등록한 피드백, 프로모션, 믹스마스터 삭제
      await Feedback.deleteMany({ musicianID: userID });
      await Promotion.deleteMany({ musicianID: userID });
      await MixMaster.deleteMany({ musicianID: userID });
    } else {
      // 전문가 탈퇴 => userID = expertID
      // 등록된 메인비디오 삭제
      await MainVideo.deleteMany({ expertID: userID });
      // 등록된 최근비디오 삭제
      await MostVideo.deleteMany({ expertID: userID });

      // 제공한 결과물 프로모션 믹스마스터 피드백에서 제거
      await Offer.updateMany({ expertID: userID }, { expertID: undefined });

      const proposalIDs = await Proposal.find({ expertID: userID }).distinct("_id");
      await Feedback.updateMany({ proposalID: { $in: proposalIDs } }, { $pull: { proposalID: { $in: proposalIDs } } });
      await Promotion.updateMany({ proposalID: { $in: proposalIDs } }, { $pull: { proposalID: { $in: proposalIDs } } });
      await MixMaster.updateMany({ proposalID: { $in: proposalIDs } }, { $pull: { proposalID: { $in: proposalIDs } } });

      await Proposal.deleteMany({ expertID: userID });
    }

    // 탈퇴할 회원의 대댓글 댓글모델에서 제거
    const recommentIDs = await Recomment.find({ userID }).distinct("_id");
    await Comment.updateMany({}, { $pull: { recommentID: { $in: recommentIDs } } });

    //  탈퇴할 회원의 대댓글 제거
    await Recomment.deleteMany({ userID });

    // 탈퇴할 회원의 컨퍼런스글에 누른 좋아요 제거
    const conferenceIDs = await Conference.find({ userID }).distinct("_id");
    await ConferenceLike.deleteMany({ conferenceID: { $in: conferenceIDs } });

    // 탈퇴한 회원이 누른 다른 컨퍼런스의 좋아요 제거
    const conferenceLikesIDs = await ConferenceLike.find({ fromUser: userID }).distinct("_id");
    await Conference.updateMany({}, { $pull: { conferenceLikeID: { $in: conferenceLikesIDs } } });

    // 탈퇴할 회원이 다른 컨퍼런스에 작성한 코멘트 제거
    const commentIDs = await Comment.find({ userID }).distinct("_id");
    await Conference.updateMany({}, { $pull: { commentID: { $in: commentIDs } } });

    // 컨퍼런스 탈퇴할 회원이 누른 좋아요 삭제
    await ConferenceLike.deleteMany({ fromUser: userID });
    // 컨퍼런스 댓글 삭제
    await Comment.deleteMany({ userID });
    // 컨퍼런스 삭제
    await Conference.deleteMany({ userID });

    // 채팅 삭제
    await Chat.deleteMany({ $or: [{ musicianID: userID }, { expertID: userID }] });
    // 리뷰 삭제
    await Review.deleteMany({ $or: [{ musicianID: userID }, { expertID: userID }] });

    // // 탈퇴할 회원에게 받은 좋아요 제거
    const likeIDs = await Like.find({ fromUser: userID }).distinct("_id");
    await User.updateMany({}, { $pull: { likeID: { $in: likeIDs } } });
    // 좋아요 삭제
    await Like.deleteMany({ $or: [{ toUser: userID }, { fromUser: userID }] });

    // 알림 삭제
    await Alarm.deleteMany({ userID });

    // 해당유저 삭제
    await User.findByIdAndDelete(userID);

    req.logout();
    req.session.destroy(() => {
      res.send(
        `<script>alert("Your membership has been successfully terminated.");\
        location.href="${routes.home}"</script>`
      );
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 아이디 비밀번호 찾기
export const getFindID = async (req, res) => {
  try {
    res.render("users/findID", {});
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

export const getFindPW = async (req, res) => {
  try {
    res.render("users/findPW", {});
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

export const postFindPW = async (req, res) => {
  try {
    const { body } = req;
    const token = crypto.randomBytes(20).toString("hex");
    const users = await User.findOneAndUpdate(
      { userID: body.userID },
      {
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 180000, // 비밀번호 변경 만료 시간: 3분
      }
    );
    const msg = {
      to: body.userID,
      from: "Info@chartinmusic.com",
      subject: "[CHARTIN] Change Password",
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
                                <p style="font-weight: 600; font-size: 18px; margin-bottom: 20px; color: #fff;">Hello,\
                                We received a request to reset the password for the CHARTIN account associated with ${body.userID}.\
                                If you didn’t request to reset your password, let us know by replying directly to this email. No changes were made to your account yet.\
                                Best,</p>
                                <table style="font-family: 'Montserrat',Arial,sans-serif;' cellpadding='0' cellspacing='0' role='presentation">
                                  <tbody>
                                    <tr>
                                      <td style="mso-padding-alt: 16px 24px; --bg-opacity: 1; background-color: #10eb73; border-radius: 4px; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif;' bgcolor='rgba(115, 103, 240, var(--bg-opacity))"><a href="http://${req.headers.host}${routes.user}${routes.findChangePW}/${users._id}?token=${token}" style="display: block; font-weight: 600; font-size: 14px; line-height: 100%; padding: 5px 24px; --text-opacity: 1; color: #ffffff; text-decoration: none; background-color: #10eb73;border-radius: 4px;">Change Password</a></td>
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
        res.send(
          `<script>alert("Check your email."); \
          location.href="${routes.user}${routes.signIn}"</script>`
        );
      },
      (error) => {
        console.log(error);
        res.send(`<script>alert("Failed to send email.");</script>`);
      }
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 비밀번호 변경
export const getFindChangePW = async (req, res) => {
  try {
    const {
      query: { token },
    } = req;
    const time = new Date();
    const users = await User.findOne({ resetPasswordToken: token });
    if (users.resetPasswordExpires < time) {
      res.send(
        `<script>alert("Link is expired. Please request for password again."); \
        location.href="${routes.user}${routes.findPW}"</script>`
      );
    } else {
      res.render("users/findPW", { users, token });
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postFindChangePW = async (req, res, next) => {
  try {
    const {
      body,
      query: { token },
    } = req;
    const users = await User.findOne({ resetPasswordToken: token });
    await users.setPassword(body.password);
    await users.save();
    req.logIn(users, async () => {
      res.send(`<script>alert("Successfully changed your password.");\
        location.href="${routes.home}"</script>`);
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
