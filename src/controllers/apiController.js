import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import fasterpay from "fasterpay-node";
import moment from "moment-timezone";
import routes from "../routes";
import User from "../models/User";
import Conference from "../models/Conference";
import ConferenceLike from "../models/ConferenceLike";
import Purchase from "../models/Purchase";
import Proposal from "../models/Proposal";
import Offer from "../models/Offer";
import Feedback from "../models/Feedback";
import Promotion from "../models/Promotion";
import MixMaster from "../models/MixMaster";
import Like from "../models/Like";
import Save from "../models/Save";
import Alarm from "../models/Alarm";
import Chat from "../models/Chat";
import Goal from "../models/Goal";
import Recomment from "../models/Recomment";
import Comment from "../models/Comment";
import MainVideo from "../models/MainVideo";
import MostVideo from "../models/MostVideo";
import Review from "../models/Review";
import BlockList from "../models/BlockList";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const gateway = new fasterpay.Gateway({
  publicKey: process.env.FASTER_PAY_PUBLIC_KEY,
  privateKey: process.env.FASTER_PAY_PRIVATE_KEY,
});

// 푸터 한국 국기 클릭 시 쿠키 등록
export const createLangCookie = (_, res) => {
  try {
    res.clearCookie("lang");
    res.cookie("lang", "ko", { expires: new Date(Date.now() + 900000), httpOnly: true });
    res.redirect("back");
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// 푸터 미국 국기 클릭 시 쿠키 삭제 [기본값: 영어]
export const deleteLangCookie = (_, res) => {
  try {
    res.clearCookie("lang");
    res.redirect("back");
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 뉴스 이미지
export const createNewsImg = async (req, res) => {
  try {
    const {
      file: { location },
    } = req;

    res.json({ location });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}"); \
      location.href="${routes.home}"</script>`
    );
  }
};

// 회원가입 시 차단 되어 있는 이메일인지 && 이메일 중복 체크
export const emailDupleChk = async (req, res) => {
  try {
    const { body } = req;
    const blockedAccount = await BlockList.findOne({ email: body.email });
    const users = await User.findOne({ userID: body.email });
    if (blockedAccount) {
      res.json({ msg: "blocked" });
    } else {
      res.json({ users });
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 회원가입 시 이메일 인증번호 전송
export const sendAuthEmail = (req, res) => {
  try {
    const { body } = req;
    const msg = {
      to: body.email,
      from: "Info@chartinmusic.com",
      subject: "[CHARTIN] This is the verification code for registration.",
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
                                <p style="font-weight: 600; font-size: 18px; margin-bottom: 0; color:#fff;">Hi!</p>
                                <h1 style="font-size:18px;margin-bottom:5px;color:#fff;">Enter the verfication number below.</h1>
                                <h2 style="font-size:24px;font-weight:bold;margin-bottom:30px;">${body.authNum}</h2>
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
                            <tr>
                              <td style="font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; font-size: 12px; padding-left: 48px; padding-right: 48px; --text-opacity: 1; color: #eceff1; color: rgba(236, 239, 241, var(--text-opacity));">
                                <p style="--text-opacity: 1; color: #263238; color: rgba(38, 50, 56, var(--text-opacity)); text-align: center;">Use of our service and website is subject to our <a class="hover-underline" href="https://chartinmusic.com/terms-of-use" style="--text-opacity: 1; color: #7367f0; color: rgba(115, 103, 240, var(--text-opacity)); text-decoration: none;">Terms of Use </a>and <a class="hover-underline" href="https://chartinmusic.com/privacy-policy" style="--text-opacity: 1; color: #7367f0; color: rgba(115, 103, 240, var(--text-opacity)); text-decoration: none;">Privacy Policy</a>.</p>
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
        res.json({ msg: "success" });
      },
      (error) => {
        console.log(error);
        res.send(`<script>alert("Failed to send code.");</script>`);
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

// Change Conference Like
export const changeConferenceLike = async (req, res) => {
  try {
    const { body } = req;
    const type = body.type;
    const today = moment(new Date()).tz("Asia/Seoul");
    body.createdAt = today;
    // Create Conference Like
    if (body.type === "createConferenceLike") {
      const conferenceLikeID = await ConferenceLike.create(body);
      await Conference.findByIdAndUpdate(body.conferenceID, { $push: { conferenceLikeID } });
      const conference = await Conference.findById(body.conferenceID).populate("userID");
      if (conferenceLikeID.fromUser[0].toString() !== conference.userID[0]._id.toString()) {
        // 알림 생성
        const alarmDesc = "Someone liked your question.";
        const alarmLink = `${routes.conferenceRoom}/detail/${conference._id}`;
        res.locals.sendAlarm(conference.userID[0]._id, alarmDesc, alarmLink);
      }
      res.json({ msg: "success", type, conference });
    } else {
      await ConferenceLike.findOne({ fromUser: body.fromUser, conferenceID: body.conferenceID }, async (err, docs) => {
        await Conference.findByIdAndUpdate(body.conferenceID, { $pull: { conferenceLikeID: { $in: docs._id } } });
        await docs.remove();
      });
      const conference = await Conference.findById(body.conferenceID);
      res.json({ msg: "success", type, conference });
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 파트너 로고 이미지 등록
export const createPartnerLogoImg = async (req, res) => {
  try {
    const { file } = req;
    const location = file.location;
    res.json({ msg: "success", location });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// 영상 썸네일 이미지 등록
export const createVideoThumbnailImg = async (req, res) => {
  try {
    const { file } = req;
    const location = file.location;
    res.json({ msg: "success", location });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// Feedback 결제 시 Trend 또는 Technical 타입 선택 시 Purchase에 데이터 저장
export const postFeedbackPurchaseSaveType = async (req, res) => {
  try {
    const {
      body: { purchaseID, feedbackType },
    } = req;
    await Purchase.findById(purchaseID, async (err, docs) => {
      if (docs.status === "pre") {
        await docs.updateOne({
          feedbackType,
          updatedAt: moment(new Date()).tz("Asia/Seoul"),
        });
      }
    });
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
// 결제 Pingback
export const postPurchasePingback = async (req, res) => {
  try {
    const {
      body,
      query: { purchaseID },
    } = req;

    const purchases = await Purchase.findById(purchaseID).populate([
      {
        path: "musicianID",
        model: "User",
      },
      {
        path: "promotionID",
        model: "Promotion",
      },
      {
        path: "mixmasterID",
        model: "MixMaster",
      },
      {
        path: "proposalID",
        model: "Proposal",
        populate: [{ path: "expertID", model: "User" }],
      },
    ]);
    const today = moment(new Date()).tz("Asia/Seoul");
    // Pingback 검증
    if (purchases && gateway.Pingback().validate(req)) {
      // POST 요청이 구매완료일 경우
      if (body.event === "payment") {
        if (purchases.type === "feedback" && purchases.status === "pre") {
          await Feedback.updateOne(
            { purchaseID },
            {
              status: "REQUESTED",
              type: purchases.feedbackType,
              musicianID: purchases.musicianID,
              createdAt: today,
              updatedAt: today,
            }
          );
          const feedback = await Feedback.findOne({ purchaseID });
          // Feedback 결제
          await purchases.updateOne({
            paymentOrderID: body.payment_order.id,
            status: body.payment_order.status,
            feedbackID: feedback._id,
            updatedAt: today,
          });
          // 알림 생성 - 결제
          const alarmDesc = "Your payment was successful. You'll shortly receive 3 unique feedbacks from verified experts.";
          const alarmLink = `${routes.userMusician}${routes.myRequest}`;
          res.locals.sendAlarm(purchases.musicianID[0]._id, alarmDesc, alarmLink);

          // 알림 - 서비스 상태 업데이트
          const alarmDesc2 = "Your Feedback service status has been updated to Requested.";
          const alarmLink2 = `${routes.userMusician}${routes.myRequest}?type=feedback&id=${feedback._id}`;
          res.locals.sendAlarm(purchases.musicianID[0]._id, alarmDesc2, alarmLink2);

          // 메일 전송
          // 제목
          const subject = `[CHARTIN] ${purchases.musicianID[0].name}, your service status has been updated on CHARTIN`;
          // 인사말
          const greetings = `Hi, CHART Winner ${purchases.musicianID[0].name}`;
          const desc = `Your feedback service status has been updated.
        Check out the status now and chat with the experts if you have any question.
        Let's get higher!`;
          res.locals.sendEmail(purchases.musicianID[0].userID, subject, greetings, desc);
        } else if (purchases.type === "promotion" && purchases.status === "pre") {
          // Promotion 결제
          await purchases.updateOne({
            paymentOrderID: body.payment_order.id,
            status: body.payment_order.status,
            updatedAt: today,
          });
          const promotions = await Promotion.findById(purchases.promotionID[0]._id).populate([
            {
              path: "proposalID",
              model: "Proposal",
              populate: {
                path: "expertID",
                model: "User",
              },
            },
          ]);
          const rejectedExperts = [];
          promotions.proposalID.forEach((x) => {
            if (x._id.toString() !== purchases.proposalID[0]._id.toString()) {
              rejectedExperts.push(x.expertID[0]._id);
              // 제목
              const subjectReject = `[CHARTIN] ${x.expertID[0].name}, We're sorry. ${purchases.musicianID[0].name} chose to go move on with an another expert.`;
              // 인사말
              const greetingsReject = `Hi, CHARTIN Professional ${x.expertID[0].name}, `;
              const descReject = `Hello, ${x.expertID[0].name}, The musician ${purchases.musicianID[0].name} chose to work with another expert. Let's go back to CHARTIN and find out new musicians who you can help with your ideas.`;
              res.locals.sendEmail(x.expertID[0].userID, subjectReject, greetingsReject, descReject);
            }
          });
          const proposalExpert = await Proposal.findByIdAndUpdate(purchases.proposalID[0]._id, { chooseBool: true }).populate("expertID");
          await Promotion.findByIdAndUpdate(purchases.promotionID[0]._id, {
            status: "IN PROGRESS",
            proposalID: purchases.proposalID[0]._id,
            expertName: proposalExpert.expertID[0].name,
          }).populate([{ path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] }]);

          // 알림 생성 - 결제한 뮤지션에게 생성
          const alarmDesc = "Your payment was successful. The promotion service will now activate. Please communicate with your designated partner for more detail.";
          const alarmLink = `${routes.userMusician}${routes.myRequest}`;
          res.locals.sendAlarm(purchases.musicianID[0]._id, alarmDesc, alarmLink);

          // 알림 생성2 - 선택된 전문가에게 생성
          const alarmDesc2 = `${purchases.musicianID[0].name} selected your proposal and requested the service to you. Respond to the request and confirm.`;
          const alarmLink2 = `${routes.userExpert}${routes.manageRequest}?type=promotion&id=${purchases.proposalID[0]._id}`;
          res.locals.sendAlarm(purchases.proposalID[0].expertID[0]._id, alarmDesc2, alarmLink2);

          // 알림 생성3 및 이메일전송 - 거절된 전문가에게 생성
          const alarmDesc3 = `We're Sorry. ${purchases.musicianID[0].name} decided to move on with a different proposal this time.`;
          const alarmMusicianListLink = `${routes.musicianList}`;
          rejectedExperts.forEach((x) => {
            res.locals.sendAlarm(x, alarmDesc3, alarmMusicianListLink);
          });

          // 알림생성 4 - 결제시 프로모션 상태 업데이트 알림
          const alarmDesc4 = "Your Promotion service status has been updated to In Progress.";
          const alarmLink4 = `${routes.userMusician}${routes.myRequest}?type=promotion&id=${promotions._id}`;
          const alarmManageRequestLink = `${routes.userExpert}${routes.manageRequest}?type=promotion&id=${purchases.proposalID[0]._id}`;
          res.locals.sendAlarm(purchases.musicianID[0]._id, alarmDesc4, alarmLink4);
          res.locals.sendAlarm(purchases.proposalID[0].expertID[0]._id, alarmDesc4, alarmManageRequestLink);

          // ========================================
          // 뮤지션이 제안받은 것중 1개 프로모션 선택시 해당 전문가에게 이메일 전송
          // 제목
          const subject = `[CHARTIN] ${purchases.proposalID[0].expertID[0].name}, your service status has been updated on CHARTIN`;
          // 인사말
          const greetings = `Hi, CHARTIN Professional ${purchases.proposalID[0].expertID[0].name}, `;
          const desc = `Your promotion service status has been updated.
          Check out the status now and chat with the musician if you have any question.
          Let's get higher!`;
          res.locals.sendEmail(purchases.proposalID[0].expertID[0].userID, subject, greetings, desc);
          // =========================================
        } else if (purchases.type === "mixmaster" && purchases.status === "pre") {
          // Mix/Master 결제
          await purchases.updateOne({
            paymentOrderID: body.payment_order.id,
            status: body.payment_order.status,
            updatedAt: today,
          });
          const mixmasters = await MixMaster.findById(purchases.mixmasterID[0]._id).populate([
            {
              path: "proposalID",
              model: "Proposal",
              populate: {
                path: "expertID",
                model: "User",
              },
            },
          ]);
          const rejectedExperts = [];
          mixmasters.proposalID.forEach((x) => {
            if (x._id.toString() !== purchases.proposalID[0]._id.toString()) {
              rejectedExperts.push(x.expertID[0]._id);

              // 제목
              const subjectReject = `[CHARTIN] ${x.expertID[0].name}, We're sorry. ${purchases.musicianID[0].name} chose to go move on with an another expert.`;
              // 인사말
              const greetingsReject = `Hi, CHARTIN Professional ${x.expertID[0].name}, `;
              const descReject = `Hello, ${x.expertID[0].name},
            The musician ${purchases.musicianID[0].name} chose to work with another expert.
            Let's go back to CHARTIN and find out new musicians who you can help with your ideas.`;

              res.locals.sendEmail(x.expertID[0].userID, subjectReject, greetingsReject, descReject);
            }
          });
          const proposalExpert = await Proposal.findByIdAndUpdate(purchases.proposalID[0]._id, { chooseBool: true }).populate("expertID");
          await MixMaster.findByIdAndUpdate(purchases.mixmasterID[0]._id, {
            status: "IN PROGRESS",
            proposalID: purchases.proposalID[0]._id,
            expertName: proposalExpert.expertID[0].name,
          }).populate([{ path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] }]);

          // 알림 생성 - 결제한 뮤지션에게 생성
          const alarmDesc = "Your payment was successful. The mix/master service will now activate. Please communicate with your designated partner for more detail.";
          const alarmLink = `${routes.userMusician}${routes.myRequest}`;
          res.locals.sendAlarm(purchases.musicianID[0]._id, alarmDesc, alarmLink);

          // 알림 생성2 - 선택된 전문가에게 생성
          const alarmDesc2 = `${purchases.musicianID[0].name} selected your proposal and requested the service to you. Respond to the request and confirm.`;
          const alarmLink2 = `${routes.userExpert}${routes.manageRequest}?type=mixmaster&id=${purchases.proposalID[0]._id}`;
          res.locals.sendAlarm(purchases.proposalID[0].expertID[0]._id, alarmDesc2, alarmLink2);

          // 알림 생성3 - 거절된 전문가에게 생성
          const alarmDesc3 = `We're Sorry. ${purchases.musicianID[0].name} decided to move on with a different proposal this time.`;
          const alarmMusicianListLink = `${routes.musicianList}`;

          rejectedExperts.forEach((x) => {
            res.locals.sendAlarm(x, alarmDesc3, alarmMusicianListLink);
          });

          // 알림생성 4 - 결제시 믹스마스터 상태 업데이트 알림
          const alarmDesc4 = "Your Mix/Master service status has been updated to In Progress.";
          const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=mixmaster&id=${mixmasters._id}`;
          const alarmManageRequestLink = `${routes.userExpert}${routes.manageRequest}?type=mixmaster&id=${purchases.proposalID[0]._id}`;
          res.locals.sendAlarm(purchases.musicianID[0]._id, alarmDesc4, alarmMyRequestLink);
          res.locals.sendAlarm(purchases.proposalID[0].expertID[0]._id, alarmDesc4, alarmManageRequestLink);

          // ========================================
          // 뮤지션이 제안받은 것중 1개 믹스마스터 선택시 해당 전문가에게 이메일 전송
          // 제목
          const subject = `[CHARTIN] ${purchases.proposalID[0].expertID[0].name}, your service status has been updated on CHARTIN`;
          // 인사말
          const greetings = `Hi, CHARTIN Professional ${purchases.proposalID[0].expertID[0].name}, `;
          const desc = `Your Mix/Master service status has been updated.
          Check out the status now and chat with the musician if you have any question.
          Let's get higher!`;
          res.locals.sendEmail(purchases.proposalID[0].expertID[0].userID, subject, greetings, desc);
          // =========================================
        } else if (purchases.type === "subscribe" && purchases.status === "pre") {
          // 구독 결제
          await purchases.updateOne({
            paymentOrderID: body.payment_order.id,
            status: body.payment_order.status,
            updatedAt: today,
          });
          await User.findByIdAndUpdate(purchases.musicianID[0]._id, {
            subscription: true,
            updatedAt: today,
          });
          // 알림 생성
          const alarmDesc = "Welcome to the Premium Club. You'll be included in our next premium service letter. Stay tuned for more detail.";
          const alarmNewsroomLink = `${routes.newsRoom}/detail/62063e8c5643a24fa80a9af1`;
          res.locals.sendAlarm(purchases.musicianID[0]._id, alarmDesc, alarmNewsroomLink);
        } else if (purchases.type === "customized" && purchases.status === "pre") {
          // Customized Payment
          await purchases.updateOne({
            paymentOrderID: body.payment_order.id,
            status: body.payment_order.status,
            updatedAt: today,
          });

          // 제목
          const subject = `[CHARTIN] ${purchases.musicianID[0].name}, Customized Payment Received`;
          const greetings = `Hello, ${purchases.musicianID[0].name},`;
          const desc = `CHARTIN hereby confirms your customized payment of ${purchases.amount} dollar. Thank you`;

          res.locals.sendEmail(purchases.musicianID[0].userID, subject, greetings, desc);

          const alarmDesc = `Your customized payment was processed successfully.`;
          const alarmLink = `${routes.userMusician}${routes.myStudio}`;
          res.locals.sendAlarm(purchases.musicianID[0]._id, alarmDesc, alarmLink);
        }
      } else if (body.event === "subscription_stopped" || body.event === "subscription_cancelled") {
        // POST 요청이 구독취소일 경우
        await purchases.updateOne({
          status: body.subscription.status.toLowerCase(),
          updatedAt: today,
        });
        await User.findByIdAndUpdate(purchases.musicianID[0]._id, {
          subscription: false,
          updatedAt: today,
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
// 결제 Success
export const getPurchaseSuccess = (req, res) => {
  try {
    const {
      query: { diagnosis, page },
    } = req;
    if (diagnosis) {
      // 서비스 진단하기 결과 페이지에서 Feedback을 결제 했을 경우
      res.send(`<script>location.href="${routes.user}${routes.serviceDiagnosis}/result/${diagnosis}?purchase=success"</script>`);
    } else if (page === "request") {
      // 서비스 요청하기 페이지에서 Feedback을 결제 했을 경우
      res.send(`<script>location.href="${routes.user}${routes.serviceRequest}?purchase=success"</script>`);
    } else if (page === "subscribe") {
      // 구독 결제 했을 경우
      res.send(`<script>location.href="${routes.user}${routes.getHigher}?purchase=success"</script>`);
    } else if (page === "myRequest") {
      // Choose에서 Promtion 또는 Mix/Master 결제 했을 경우
      res.send(`<script>location.href="${routes.userMusician}${routes.myRequest}"</script>`);
    } else if (page === "myStudio") {
      res.send(`<script>location.href="${routes.userMusician}${routes.myStudio}"</script>`);
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// Promotion 생성
export const createRequestedPromotion = async (req, res) => {
  try {
    const { body } = req;
    const today = moment(new Date()).tz("Asia/Seoul");

    // body.markets = res.locals.absoluteArr(body.markets);
    body.createdAt = today;
    body.updatedAt = today;
    body.video = body.video === "Yes" ? true : false;
    body.musicianID = req.user._id;
    body.expertID = body.expertID;
    body.status = "REQUESTED";
    body.serviceType = body.serviceType && body.serviceType === "direct" ? true : false;
    const promotion = await Promotion.create(body);

    const musicians = await User.findById(req.user._id);
    const expert = await User.findById(body.expertID);
    if (body.serviceType) {
      // 알림 생성 - 뮤지션
      const alarmDesc = "Your Promotion service status has been updated to Requested.";
      const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=promotion&id=${promotion._id}`;
      res.locals.sendAlarm(req.user._id, alarmDesc, alarmMyRequestLink);

      // 알림 생성 - 전문가
      const alarmDesc2 = `New service request by a musician ${musicians.name}.`;
      const alarmServiceRequestLink = `${routes.musicianList}/detail/${promotion._id}/${req.user._id}?type=promotion`;
      res.locals.sendAlarm(body.expertID, alarmDesc2, alarmServiceRequestLink);

      // ========================================
      // 뮤지션이 해당전문가에게 직접 요청한 프로모션일경우
      // 제목
      const subject = `[CHARTIN] ${expert.name}, you've got a proposal request from a musician`;
      // 인사말
      const greetings = `Hi, CHARTIN Professional ${expert.name}, `;
      const desc = `Good news!
      Our musician wants to promote his music and chose you to be a partner.
      Check out the request now and send a proposal.
      Let's get higher!`;
      res.locals.sendEmail(expert.userID, subject, greetings, desc);
      // =========================================
    } else {
      // 알림 생성
      const alarmDesc = "Your Promotion service status has been updated to Requested.";
      const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=promotion&id=${promotion._id}`;
      res.locals.sendAlarm(req.user._id, alarmDesc, alarmMyRequestLink);
    }
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// MixMaster 생성
export const createRequestedMixMaster = async (req, res) => {
  try {
    const { body } = req;
    const today = moment(new Date()).tz("Asia/Seoul");
    body.status = "REQUESTED";
    body.createdAt = today;
    body.updatedAt = today;
    body.musicianID = req.user._id;
    body.expertID = body.expertID;
    body.serviceType = body.serviceType && body.serviceType === "direct" ? true : false;
    const mixmaster = await MixMaster.create(body);
    const musicians = await User.findById(req.user._id);
    const expert = await User.findById(body.expertID);
    if (body.serviceType) {
      // 알림 생성 - 뮤지션
      const alarmDesc = "Your Mix/Master service status has been updated to Requested.";
      const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=mixmaster&id=${mixmaster._id}`;
      res.locals.sendAlarm(req.user._id, alarmDesc, alarmMyRequestLink);
      // 알림 생성 - 전문가
      // 알림 생성 - 전문가
      const alarmDesc2 = `New service request by a musician ${musicians.name}.`;
      const alarmServiceRequestLink = `${routes.musicianList}/detail/${mixmaster._id}/${req.user._id}?type=mixmaster`;
      res.locals.sendAlarm(body.expertID, alarmDesc2, alarmServiceRequestLink);
      // ========================================
      // 뮤지션이 해당전문가에게 직접 요청한 믹스마스터일경우
      // 제목
      const subject = `[CHARTIN] ${expert.name}, you've got a proposal request from a musician`;
      // 인사말
      const greetings = `Hi, CHARTIN Professional ${expert.name}, `;
      const desc = `Good news!
      Our musician wants to promote his music and chose you to be a partner.
      Check out the request now and send a proposal.
      Let's get higher!`;
      res.locals.sendEmail(expert.userID, subject, greetings, desc);
      // =========================================
    } else {
      // 알림 생성
      const alarmDesc = "Your Mix/Master service status has been updated to Requested.";
      const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=mixmaster&id=${mixmaster._id}`;
      res.locals.sendAlarm(req.user._id, alarmDesc, alarmMyRequestLink);
    }
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// User Like
export const changeUserLike = async (req, res) => {
  try {
    const { body } = req;

    const today = moment(new Date()).tz("Asia/Seoul");
    body.createdAt = today;
    body.fromUser = req.user._id;
    // Create Like
    if (body.type === "createUserLike") {
      const likeID = await Like.create(body);
      await User.findByIdAndUpdate(body.toUser, { $push: { likeID } });
      const user = await User.findById(body.toUser);
      // 알림 생성
      let alarmDesc;
      let alarmProfileLink;
      if (user.role === "musician") {
        alarmDesc = "You've got a new like from our expert.";
        alarmProfileLink = `${routes.userMusician}${routes.expertDetail}/${body.fromUser}`;
      } else {
        alarmDesc = "You've got a new like from a musician.";
        alarmProfileLink = `${routes.musicianList}/detail/1/${body.fromUser}`;
      }
      res.locals.sendAlarm(user._id, alarmDesc, alarmProfileLink);
      res.json({ msg: "success", likeID, user });
    } else {
      await Like.findById(body.likeID, async (err, docs) => {
        await User.findByIdAndUpdate(body.toUser, { $pull: { likeID: { $in: docs._id } } });
        await docs.remove();
      });
      const user = await User.findById(body.toUser);
      res.json({ msg: "success", user });
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Get Higher - Mission Start
export const postMissionStart = async (req, res) => {
  try {
    const { body } = req;
    const users = await User.findById(req.user._id).populate("missions.missionID");
    await users.missions.push({
      status: "doing",
      start: moment(new Date()).tz("Asia/Seoul"),
      missionID: body.missionID,
    });
    await users.save();
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// Get Higher - Mission Complete
export const postMissionComplete = async (req, res) => {
  try {
    const { body } = req;
    const users = await User.findById(req.user._id).populate("missions.missionID");
    await users.missions.forEach((x) => {
      if (x.missionID._id.toString() === body.missionID) {
        x.status = "complete";
      }
    });
    await users.save();
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// Get Higher - Mission Restart
export const postMissionRestart = async (req, res) => {
  try {
    const { body } = req;
    const users = await User.findById(req.user._id).populate("missions.missionID");
    await users.missions.forEach((x) => {
      if (x.missionID._id.toString() === body.missionID) {
        x.status = "doing";
        x.start = moment(new Date()).tz("Asia/Seoul");
      }
    });
    await users.save();
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// See proposal Feedback Choose 버튼 클릭 시
export const postFeedbackChoose = async (req, res) => {
  try {
    const {
      body: { feedbackID, totalOfferID, selectedOfferID },
    } = req;
    // Feedback status DONE으로 변경, offerID 선택받은 것만 삽입
    let musicianName = "";
    const musician = await Feedback.findByIdAndUpdate(
      feedbackID,
      {
        status: "DONE",
        updatedAt: moment(new Date()).tz("Asia/Seoul"),
      },
      async (err, docs) => {
        musicianName = await docs.musicianID[0].name;
      }
    ).populate("musicianID");
    await Offer.findByIdAndUpdate(selectedOfferID, { chooseBool: true });
    await Offer.updateMany({ _id: { $in: totalOfferID } }, { finishOffer: true });
    const offers = await Offer.find({ _id: { $in: totalOfferID } }).populate("expertID");
    offers.forEach(async (x) => {
      if (x._id.toString() === selectedOfferID) {
        // 선택받은 1명에게 10 USD 정산
        await Save.create({
          type: "plus",
          requestType: "Feedback",
          musicianName,
          amount: 10,
          expertID: x.expertID[0]._id,
          createdAt: moment(new Date()).tz("Asia/Seoul"),
        });

        // 알림 생성
        // 상태업데이트 알림
        const alarmDesc = `Your Feedback service status has been updated to Done.`;
        const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=feedback&id=${musician._id}`;
        const alarmManageRequestLink = `${routes.userExpert}${routes.manageRequest}?type=feedback&id=${selectedOfferID}`;
        res.locals.sendAlarm(x.expertID[0]._id, alarmDesc, alarmManageRequestLink);
        res.locals.sendAlarm(req.user._id, alarmDesc, alarmMyRequestLink);

        // 베스트 피드백커로 선정 알림
        // 전문가에게 보내는 알림
        const alarmDesc2 = `${musicianName} chose your feedback as the 'best feedback'! As a reward, you'll receive extra payment.`;
        res.locals.sendAlarm(x.expertID[0]._id, alarmDesc2, alarmManageRequestLink);
        // 뮤지션에게 보내는 알림
        const alarmDesc3 = `Best Feedback selected. Your choice will be reflected on the final payment feedbackers receive.`;
        res.locals.sendAlarm(req.user._id, alarmDesc3, alarmMyRequestLink);

        // 선정된 전문가에게 메일전송
        // ========================================
        // 전문가가 피드백 작성 후 제안시 해당 뮤지션에게 이메일 전송
        // 제목
        const subject = `[CHARTIN] ${x.expertID[0].name}, Good news! Your feedback was selected as the 'best feedback'!`;
        // 인사말
        const greetings = `Hello, The musician ${musicianName}, `;
        const desc = `has reviewed your feedback and chose it as the 'best feedback.'
        Your increased pay will be reflected on the total balance. For more detail, please visit our newsroom guide`;
        const linkTitle = "(Pay and Withdrawal).";
        const withdrawalLink = `/news-room/detail/62075a82b4b5fb77faa37f79`;
        res.locals.sendEmail(x.expertID[0].userID, subject, greetings, desc, linkTitle, withdrawalLink);
        // =========================================
        // ========================================
        // 뮤지션이 제공받은 피드백중 하나 선택시 해당 전문가에게 상테업데이트 이메일 전송
        // 제목
        const subjectExpert = `[CHARTIN] ${x.expertID[0].name}, your service status has been updated on CHARTIN`;
        // 인사말
        const greetingsExpert = `Hi, CHARTIN Professional ${x.expertID[0].name}, `;
        const descExpert = `Your feedback service status has been updated.
    Check out the status now and chat with the experts if you have any question.
    Let's get higher!`;
        res.locals.sendEmail(x.expertID[0].userID, subjectExpert, greetingsExpert, descExpert);
        // =========================================
      } else {
        // 선택받지못한 2명에게 7.5 USD 정산
        await Save.create({
          type: "plus",
          requestType: "Feedback",
          musicianName,
          amount: 7.5,
          expertID: x.expertID[0]._id,
          createdAt: moment(new Date()).tz("Asia/Seoul"),
        });
        // 알림 생성
        const alarmDesc2 = `Feedback process for ${musicianName} is now completed. Let's aim for the best feedback next time!`;
        const alarmManageRequestLink = `${routes.musicianList}`;
        res.locals.sendAlarm(x.expertID[0]._id, alarmDesc2, alarmManageRequestLink);

        // 메일전송
        // 제목
        const subject = `Feedback completed for ${musicianName}`;
        // 인사말
        const greetings = `Hello, ${x.expertID[0].name}, `;
        const desc = `Your valuable feedback was well received by ${musicianName} and now all process is completed.
        Let's aim for the best feedback next time. You'll then receive twice the money you've just received.
        To improve your chance of being the best feedbacker, please check out our newsroom articles on`;
        const linkTitle = "'How to give a meaningful feedback'.";
        const withdrawalLink = `/news-room/detail/6233f5506f5599198a8c3ac4`;

        res.locals.sendEmail(x.expertID[0].userID, subject, greetings, desc, linkTitle, withdrawalLink);
      }
    });

    const selectedOffer = await Offer.findById(selectedOfferID, async (err, docs) => {
      await User.findByIdAndUpdate(docs.expertID[0]._id, { $push: { approvedOffers: selectedOfferID } });
    }).populate([{ path: "expertID", model: "User" }]);

    // DONE일때 리뷰작성 알림
    const alarmDesc = "Your service is now completed. Let's leave a review!";
    const alarmExpertReviewLink = `${routes.userMusician}${routes.expertReview}/${selectedOffer.expertID[0]._id}`;
    res.locals.sendAlarm(musician.musicianID[0]._id, alarmDesc, alarmExpertReviewLink);

    // ========================================
    // 뮤지션이 제공받은 피드백중 하나 선택시 리뷰요청 메일 뮤지션에게 전송
    // 제목
    const subject = `[CHARTIN] ${musicianName}, you've got a new message on CHARTIN`;
    // 인사말
    const greetings = `Hi, CHARTIN Winner ${musicianName}, `;
    const desc = `Your service is complete now. Let's leave a review and rate the service!`;
    res.locals.sendEmail(musician.musicianID[0].userID, subject, greetings, desc);
    // =========================================
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Reception Choose 모달 팝업 Purchase 버튼 클릭 시 purchaseForm 생성
export const postChoosePurchaseForm = async (req, res) => {
  try {
    const {
      body: { proposalID, receptionID, type, amount },
    } = req;
    const today = moment(new Date()).tz("Asia/Seoul");
    const merchant_order_id = new Date().getTime().toString();
    const createQuery = {
      type,
      status: "pre",
      musicianID: req.user._id,
      description: `Pay(${type === "promotion" ? "Promotion" : "Mix/Master"})`,
      amount,
      proposalID,
      currency: "USD",
      merchant_order_id,
      createdAt: today,
      updatedAt: today,
    };
    if (type === "promotion") {
      createQuery.promotionID = receptionID;
    } else {
      createQuery.mixmasterID = receptionID;
    }

    // Pre-Purchase 생성
    const purchases = await Purchase.create(createQuery);

    // Faster Pay 결제 폼 생성 로직
    const purchaseForm = gateway.PaymentForm().buildForm(
      {
        description: `Pay(${type === "promotion" ? "Promotion" : "Mix/Master"})`,
        amount,
        currency: "USD",
        merchant_order_id,
        sign_version: "v1",
        success_url: `https://chartinmusic.com/api/purchase/success?page=myRequest`,
        pingback_url: `https://chartinmusic.com/api/purchase/pingback?purchaseID=${purchases._id}`,
      },
      {
        autoSubmit: false,
        hidePayButton: false,
      }
    );
    res.json({ msg: "success", purchaseForm });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Approve btn click => change requested status
export const chageRequestedStatus = async (req, res) => {
  try {
    const {
      body: { requestedID, type, expertID },
    } = req;
    const today = moment(new Date()).tz("Asia/Seoul");
    let requests;
    // 메일보내기위한 변수
    let approvedService;
    if (type === "promotion") {
      await Promotion.findByIdAndUpdate(requestedID, { updatedAt: today, status: "DONE" }, async (err, docs) => {
        requests = docs;
        await User.findByIdAndUpdate(expertID, { $push: { approvedOffers: docs.offerID[0]._id } });

        // 알림생성  - 승인시 프로모션 상태 업데이트 알림
        const alarmDesc = "Your Promotion service status has been updated to Done.";
        const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=promotion&id=${docs._id}`;
        const alarmManageRequestLink = `${routes.userExpert}${routes.manageRequest}?type=promotion&id=${docs.proposalID[0]._id}`;
        res.locals.sendAlarm(docs.musicianID[0]._id, alarmDesc, alarmMyRequestLink);
        res.locals.sendAlarm(expertID, alarmDesc, alarmManageRequestLink);

        // DONE일때 리뷰작성 알림
        const alarmDesc2 = "Your service is now completed. Let's leave a review!";
        const alarmExpertReviewLink = `${routes.userMusician}${routes.expertReview}/${expertID}`;
        res.locals.sendAlarm(docs.musicianID[0]._id, alarmDesc2, alarmExpertReviewLink);
      }).populate([
        {
          path: "proposalID",
          model: "Proposal",
          populate: [{ path: "expertID", model: "User" }],
        },
        {
          path: "musicianID",
          model: "User",
        },
      ]);
      approvedService = await Promotion.findById(requestedID).populate([
        {
          path: "proposalID",
          model: "Proposal",
          populate: [{ path: "expertID", model: "User" }],
        },
        {
          path: "musicianID",
          model: "User",
        },
      ]);
    } else {
      await MixMaster.findByIdAndUpdate(requestedID, { updatedAt: today, status: "DONE" }, async (err, docs) => {
        requests = docs;
        await User.findByIdAndUpdate(expertID, { $push: { approvedOffers: docs.offerID[0]._id } });

        // 알림생성  - 승인시 믹스마스터 상태 업데이트 알림
        const alarmDesc = "Your Mix/Master service status has been updated to Done";
        const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=mixmaster&id=${docs._id}`;
        const alarmManageRequestLink = `${routes.userExpert}${routes.manageRequest}?type=mixmaster&id=${docs.proposalID[0]._id}`;
        res.locals.sendAlarm(docs.musicianID[0]._id, alarmDesc, alarmMyRequestLink);
        res.locals.sendAlarm(expertID, alarmDesc, alarmManageRequestLink);

        // DONE일때 리뷰작성 알림
        const alarmDesc2 = "Your service is now completed. Let's leave a review!";
        const alarmExpertReviewLink = `${routes.userMusician}${routes.expertReview}/${expertID}`;
        res.locals.sendAlarm(docs.musicianID[0]._id, alarmDesc2, alarmExpertReviewLink);
      }).populate([
        {
          path: "proposalID",
          model: "Proposal",
          populate: [{ path: "expertID", model: "User" }],
        },
        {
          path: "musicianID",
          model: "User",
        },
      ]);
      approvedService = await MixMaster.findById(requestedID).populate([
        {
          path: "proposalID",
          model: "Proposal",
          populate: [{ path: "expertID", model: "User" }],
        },
        {
          path: "musicianID",
          model: "User",
        },
      ]);
    }

    // ========================================
    // 뮤지션이 제공받은 프로모션 결과물 승인했을 때 리뷰 작성을 요청하는 메일을 해당 뮤지션에게 전송
    // 제목
    const subjectMusician = `[CHARTIN] ${approvedService.musicianID[0].name}, you've got a new message on CHARTIN`;
    // 인사말
    const greetingsMusician = `Hi, CHART Winner ${approvedService.musicianID[0].name}, `;
    const descMusician = `Your service is complete now. Let's leave a review and rate the service!`;
    res.locals.sendEmail(approvedService.musicianID[0].userID, subjectMusician, greetingsMusician, descMusician);
    // =========================================

    // ========================================
    // 뮤지션이 제공받은 프로모션 결과물 승인했을 때 전문가에게 메일 전송
    // 제목
    const subject = `[CHARTIN] ${approvedService.proposalID[0].expertID[0].name}, your service status has been updated on CHARTIN`;
    // 인사말
    const greetings = `Hi, CHARTIN Professional ${approvedService.proposalID[0].expertID[0].name}, `;
    const desc = `Your ${approvedService.title === "mixmaster" ? "Mix/Master" : "promotion"} service status has been updated.
      Check out the status now and chat with the musician if you have any question.
      Let's get higher!`;
    res.locals.sendEmail(approvedService.proposalID[0].expertID[0].userID, subject, greetings, desc);
    // =========================================
    const proposals = await Proposal.findById(requests.proposalID[0]._id);
    await Save.create({
      type: "plus",
      requestType: type === "promotion" ? "Promotion" : "Mix/Master",
      musicianName: requests.musicianID[0].name,
      amount: (proposals.budget * 0.85).toFixed(2),
      expertID: proposals.expertID[0]._id,
      createdAt: moment(new Date()).tz("Asia/Seoul"),
    });

    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 채팅방 나가기 버튼 클릭 시 삭제
export const postLeaveChat = async (req, res) => {
  try {
    const {
      body: { chatID },
    } = req;
    await Chat.findByIdAndDelete(chatID);
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// 서버에 채팅 대화 내용 저장
export const postSaveChat = async (req, res) => {
  try {
    const {
      body: { chatID, chatBody },
    } = req;
    await Chat.findByIdAndUpdate(chatID, { talk: chatBody, updatedAt: moment(new Date()).tz("Asia/Seoul") });
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// 채팅 진행 시 상대방에게 알림 및 이메일 전송
export const postChatAlarm = async (req, res) => {
  try {
    const {
      body: { chatID, userRole },
    } = req;
    const chats = await Chat.findById(chatID).populate([
      { path: "musicianID", model: "User" },
      { path: "expertID", model: "User" },
    ]);
    // 알림 생성
    let alarmDesc;
    const alarmChatLink = `${routes.user}${routes.chat}/detail/${chatID}`;
    if (userRole === "musician") {
      // 전문가 안읽은 메시지 수 1 증가
      await Chat.findByIdAndUpdate(chatID, { eUnread: chats.eUnread + 1 });
      alarmDesc = `New messages from ${chats.musicianID[0].name} arrived in your studio.`;
      res.locals.sendAlarm(chats.expertID[0]._id, alarmDesc, alarmChatLink);
      // ========================================
      // 뮤지션이 채팅 전송 시 전문가에게 메일 전송
      // 제목
      const subjectExpert = `[CHARTIN] ${chats.expertID[0].name}, you've got a new message on CHARTIN`;
      // 인사말
      const greetingsExpert = `Hello, CHART Professional ${chats.expertID[0].name},`;
      const descExpert = `A new message's arrived in your studio.
      Check out your chat room and discuss how you can grow forward!
      Let's get higher!`;
      res.locals.sendEmail(chats.expertID[0].userID, subjectExpert, greetingsExpert, descExpert);
      // =========================================
    } else {
      // 뮤지션 안읽은 메시지 수 1 증가
      await Chat.findByIdAndUpdate(chatID, { mUnread: chats.mUnread + 1 });
      alarmDesc = `New messages from ${chats.expertID[0].name} arrived in your studio.`;
      res.locals.sendAlarm(chats.musicianID[0]._id, alarmDesc, alarmChatLink);
      // ========================================
      // 전문가가 채팅 전송 시 뮤지션에게 메일 전송
      // 제목
      const subjectMusician = `[CHARTIN] ${chats.musicianID[0].name}, you've got a new message on CHARTIN`;
      // 인사말
      const greetingsMusician = `Hello, ${chats.musicianID[0].name}, `;
      const descMusician = `A new message has arrived in your studio.
      Check out your chat room and discuss how you can grow forward!
      Let's get higher!`;
      res.locals.sendEmail(chats.musicianID[0].userID, subjectMusician, greetingsMusician, descMusician);
      // =========================================
    }
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 뮤지션 My Studio Goal 생성/수정
export const postMyStudioGoal = async (req, res) => {
  try {
    const {
      body: { goalID, desc },
    } = req;
    if (goalID === "") {
      await Goal.create({
        musicianID: req.user._id,
        desc,
        createdAt: moment(new Date()).tz("Asia/Seoul"),
      });
    } else {
      await Goal.findByIdAndUpdate(goalID, { desc });
    }
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 뮤지션 My Studio Customized Payment에서 Purchase 버튼 클릭 시 purchaseForm 생성
export const postMyStudioPurchaseForm = async (req, res) => {
  try {
    const {
      body: { amount },
    } = req;

    const today = moment(new Date()).tz("Asia/Seoul");
    const merchant_order_id = new Date().getTime().toString();

    // Pre-Purchase 생성
    const purchases = await Purchase.create({
      type: "customized",
      status: "pre",
      musicianID: req.user._id,
      description: "Customized Payment",
      amount,
      currency: "USD",
      merchant_order_id,
      createdAt: today,
      updatedAt: today,
    });

    // Faster Pay 결제 폼 생성 로직
    const purchaseForm = gateway.PaymentForm().buildForm(
      {
        description: "Customized Payment",
        amount,
        currency: "USD",
        merchant_order_id,
        sign_version: "v1",
        success_url: `https://chartinmusic.com/api/purchase/success?page=myStudio`,
        pingback_url: `https://chartinmusic.com/api/purchase/pingback?purchaseID=${purchases._id}`,
      },
      {
        autoSubmit: false,
        hidePayButton: false,
      }
    );
    res.json({ msg: "success", purchaseForm });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 인출요청금액 점검
export const WithdrawalAmountChk = async (req, res) => {
  try {
    const { body } = req;
    const saves = await Save.find({ expertID: req.user._id });
    let totalBalance = 0;

    saves.forEach((x) => {
      totalBalance += x.amount;
    });

    if (body.amount > totalBalance) {
      res.json({ msg: "fail" });
    } else {
      res.json({ msg: "success" });
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 정산완료시 save status await => complete
export const changeSaveStatus = async (req, res) => {
  try {
    const {
      body: { saveID },
    } = req;
    await Save.findByIdAndUpdate(saveID, { status: "complete" });

    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 하단 쿠키 정책 팝업 Accept 버튼 클릭 시 쿠키 저장
export const postSetPrivacyCookie = (req, res) => {
  try {
    res.cookie("privacyCookie", "true", { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 알림 아이콘 클릭 시 읽음 처리
export const postAlarmRead = async (req, res) => {
  try {
    const { body } = req;
    await Alarm.updateMany({ _id: { $in: body.notReadArr } }, { read: true });
    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 직접요청 버튼 클릭시 헤당전문가와 현재진행중인 피드백, 프로모션, 믹스마스터 있는지 점검 (있으면 요청 불가)
// export const checkInProgressService = async (req, res) => {
//   try {
//     const {
//       body: { expertID, musicianID },
//     } = req;

//     const offerIDs = await Offer.find({ expertID }).distinct("_id");
//     const proposalIDs = await Proposal.find({ expertID }).distinct("_id");

//     const feedbacks = await Feedback.find({ offerID: { $in: offerIDs }, status: { $ne: "DONE" } }).distinct("musicianID");
//     const promotions = await Promotion.find({ proposalID: { $in: proposalIDs }, status: { $ne: "DONE" } }).distinct("musicianID");
//     const mixmasters = await MixMaster.find({ proposalID: { $in: proposalIDs }, status: { $ne: "DONE" } }).distinct("musicianID");
//     const allService = [];
//     feedbacks.forEach((x) => {
//       allService.push(x.toString());
//     });
//     promotions.forEach((x) => {
//       allService.push(x.toString());
//     });
//     mixmasters.forEach((x) => {
//       allService.push(x.toString());
//     });

//     if (allService.includes(musicianID)) {
//       res.json({ msg: "fail" });
//     } else {
//       res.json({ msg: "success" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.send(
//       `<script>alert("An error has occurred.:\\r\\n${err}");\
//       location.href="${routes.home}"</script>`
//     );
//   }
// };

// 컨퍼런스 사진 첨부
export const uploadConferenceFile = async (req, res) => {
  try {
    const {
      file: { location },
    } = req;

    res.json({ msg: "success", location });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 회원가입 이름중복체크
export const checkName = async (req, res) => {
  try {
    const {
      body: { name },
    } = req;

    const user = await User.find({ name });
    if (user.length !== 0) {
      res.json({ msg: "fail" });
    } else {
      res.json({ msg: "success" });
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 프로필업데이트 이름중복체크
export const checkNameUpdate = async (req, res) => {
  try {
    const {
      body: { name, userID },
    } = req;

    const user = await User.find({ _id: { $ne: userID }, name });
    if (user.length !== 0) {
      res.json({ msg: "fail" });
    } else {
      res.json({ msg: "success" });
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 대댓글 생성
export const createRecomment = async (req, res) => {
  try {
    const { body } = req;

    const genreArr = res.locals.musicianGenreArr;
    const titleArr = res.locals.expertTitleArr;
    let gradientColor;
    let userInfo1;
    let userInfo2;
    let name;
    await User.findById(body.userID, (err, docs) => {
      gradientColor = docs.gradientColor;
      name = docs.name;
      userInfo2 = docs.currentCountry;
      if (docs.role === "musician") {
        genreArr.forEach((x) => {
          if (x.id === docs.genre) {
            userInfo1 = x.name;
          }
        });
      } else {
        titleArr.forEach((x) => {
          if (x.id === docs.title) {
            userInfo1 = x.name;
          }
        });
      }
    });
    const recomment = await Recomment.create(body);
    const comments = await Comment.findByIdAndUpdate(body.commentID, { $push: { recommentID: recomment._id } }).populate([
      { path: "userID", model: "User" },
      { path: "conferenceID", model: "Conference", populate: [{ path: "userID", model: "User" }] },
    ]);
    const alarmDesc = "You've got a new comment.";
    const alarmLink = `${routes.conferenceRoom}/detail/${comments.conferenceID[0]._id}`;
    res.locals.sendAlarm(comments.userID[0]._id, alarmDesc, alarmLink);
    res.locals.sendAlarm(comments.conferenceID[0].userID[0]._id, alarmDesc, alarmLink);
    res.json({ msg: "success", gradientColor, userInfo1, name, userInfo2 });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 아이디 찾기
export const postFindID = async (req, res) => {
  try {
    const { body } = req;

    const user = await User.find({ userID: body.userID });

    if (user.length === 0) {
      // 존재하는 아이디 없음
      res.json({ msg: "fail" });
    } else {
      // 존재하는 아이디 있음
      res.json({ msg: "success" });
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 비밀번호 찾기 시 이메일 인증번호 전송
export const sendAuthPassword = (req, res) => {
  try {
    const { body } = req;
    const msg = {
      to: body.email,
      from: "Info@chartinmusic.com",
      subject: "[CHARTIN] This is the verification code for change your password.",
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
                                <p style="font-weight: 600; font-size: 18px; margin-bottom: 0; color:#fff;">Hi!</p>
                                <h1 style="font-size:18px;margin-bottom:5px;color:#fff;">Enter the verfication number below.</h1>
                                <h2 style="font-size:24px;font-weight:bold;margin-bottom:30px;">${body.authNum}</h2>
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
                            <tr>
                              <td style="font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; font-size: 12px; padding-left: 48px; padding-right: 48px; --text-opacity: 1; color: #eceff1; color: rgba(236, 239, 241, var(--text-opacity));">
                                <p style="--text-opacity: 1; color: #263238; color: rgba(38, 50, 56, var(--text-opacity)); text-align: center;">Use of our service and website is subject to our <a class="hover-underline" href="https://chartinmusic.com/terms-of-use" style="--text-opacity: 1; color: #7367f0; color: rgba(115, 103, 240, var(--text-opacity)); text-decoration: none;">Terms of Use </a>and <a class="hover-underline" href="https://chartinmusic.com/privacy-policy" style="--text-opacity: 1; color: #7367f0; color: rgba(115, 103, 240, var(--text-opacity)); text-decoration: none;">Privacy Policy</a>.</p>
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
        res.json({ msg: "success" });
      },
      (error) => {
        console.log(error);
        res.send(`<script>alert("Failed to send code.");</script>`);
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

// 피드백 작성 후 생성
export const createFeedbackBeforePurchase = async (req, res) => {
  try {
    const { body } = req;
    await Feedback.create(body);

    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 계정 Block 처리
export const postBlockUser = async (req, res) => {
  try {
    const {
      body: { userID },
    } = req;
    const users = await User.findById(userID);
    if (users.role === "musician") {
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

    // 해당 유저 블락 리스트에 추가
    await BlockList.create({
      email: users.userID,
      createdAt: moment(new Date()).tz("Asia/Seoul"),
    });

    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// 계정 Unblock 처리
export const postUnblockUser = async (req, res) => {
  try {
    const {
      body: { dataID },
    } = req;
    await BlockList.findByIdAndDelete(dataID);

    res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
