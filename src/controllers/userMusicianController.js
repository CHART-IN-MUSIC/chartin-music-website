import paginate from "express-paginate";
import dotenv from "dotenv";
import passport from "passport";
import sgMail from "@sendgrid/mail";
import moment from "moment-timezone";
import MobileDetect from "mobile-detect";
import routes from "../routes";
import User from "../models/User";
import Chat from "../models/Chat";
import Feedback from "../models/Feedback";
import Promotion from "../models/Promotion";
import MixMaster from "../models/MixMaster";
import Review from "../models/Review";
import Offer from "../models/Offer";
import Purchase from "../models/Purchase";
import Goal from "../models/Goal";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Only Musician Dashboard [뮤지션 대시보드 하위 페이지만 작성]

// My Studio
export const getMyStudio = async (req, res) => {
  try {
    // Goal 불러오기
    const goals = await Goal.find({ musicianID: req.user._id }).populate("musicianID");
    for (let i = 0; i < 3; i += 1) {
      if (!goals[i]) {
        goals[i] = null;
      }
    }
    // 완료된 작업 수
    const completedPromotions = await Promotion.find({
      musicianID: req.user._id,
      status: "DONE",
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate([
        {
          path: "offerID",
          model: "Offer",
          populate: {
            path: "expertID",
            model: "User",
          },
        },
      ]);
    const feedbacks = await Feedback.find({ musicianID: req.user._id });
    const promotions = await Promotion.find({ musicianID: req.user._id });
    const mixmasters = await MixMaster.find({ musicianID: req.user._id });
    let requestedNumber = 0;
    let completedNumber = 0;
    let activityNumber = 0;
    feedbacks.forEach((x) => {
      if (x.status === "RESULT" || x.status === "DONE") {
        completedNumber += 1;
      } else {
        requestedNumber += 1;
      }
      if (x.status === "DONE" && moment(new Date()).diff(moment(x.updatedAt), "days") < 31) activityNumber += 1;
    });
    promotions.forEach((x) => {
      if (x.status === "RESULT" || x.status === "DONE") {
        completedNumber += 1;
      } else {
        requestedNumber += 1;
      }
      if (x.status === "DONE" && moment(new Date()).diff(moment(x.updatedAt), "days") < 31) activityNumber += 1;
    });
    mixmasters.forEach((x) => {
      if (x.status === "RESULT" || x.status === "DONE") {
        completedNumber += 1;
      } else {
        requestedNumber += 1;
      }
      if (x.status === "DONE" && moment(new Date()).diff(moment(x.updatedAt), "days") < 31) activityNumber += 1;
    });
    res.render("usersMusician/myStudio", { goals, completedPromotions, requestedNumber, completedNumber, activityNumber });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// My Request
export const getMyRequest = async (req, res) => {
  try {
    const {
      query: { type, id },
    } = req;

    let totalMyRequest;
    if (type && id) {
      if (type === "feedback") {
        totalMyRequest = await Feedback.find({ _id: id }).populate([{ path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] }]);
      } else if (type === "promotion") {
        totalMyRequest = await Promotion.find({ _id: id }).populate([
          // 요청 후 제안한 전문가들
          { path: "expertID", model: "User" },
          { path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] },
          // 제안한 전문가들 중 1명 선택 후 해당 전문가가 업로드한 결과물
          { path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] },
        ]);
      } else {
        totalMyRequest = await MixMaster.find({ _id: id }).populate([
          // 요청 후 제안한 전문가들
          { path: "expertID", model: "User" },
          { path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] },
          // 제안한 전문가들 중 1명 선택 후 해당 전문가가 업로드한 결과물
          { path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] },
        ]);
      }
      res.render("usersMusician/myRequest", { totalMyRequest, pagination: false });
    } else {
      const myRequest = [];
      // 내가 요청한 feedback, promotion, mixmaster
      const feedbacks = await Feedback.find({ musicianID: req.user._id }).populate([{ path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] }]);
      const promotions = await Promotion.find({ musicianID: req.user._id }).populate([
        // 요청 후 제안한 전문가들
        { path: "expertID", model: "User" },
        { path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] },
        // 제안한 전문가들 중 1명 선택 후 해당 전문가가 업로드한 결과물
        { path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] },
      ]);
      const mixmasters = await MixMaster.find({ musicianID: req.user._id }).populate([
        // 요청 후 제안한 전문가들
        { path: "expertID", model: "User" },
        { path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] },
        // 제안한 전문가들 중 1명 선택 후 해당 전문가가 업로드한 결과물
        { path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] },
      ]);

      feedbacks.forEach((x) => {
        myRequest.push(x);
      });
      promotions.forEach((x) => {
        myRequest.push(x);
      });
      mixmasters.forEach((x) => {
        myRequest.push(x);
      });
      myRequest.sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      const page = req.query.page;
      const limit = req.query.limit;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const totalCount = myRequest.length;
      totalMyRequest = myRequest.slice(startIndex, endIndex);
      const pageCount = Math.ceil(totalCount / req.query.limit);
      const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

      res.render("usersMusician/myRequest", { totalMyRequest, totalCount, pageCount, pages, limit, pagination: true });
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Expert Detail
export const getExpertDetail = async (req, res) => {
  try {
    const {
      params: { expertID },
    } = req;
    const pageType = "detail";
    const expert = await User.findById(expertID).populate("likeID");

    // 프로모션중 해당 전문가가 제작하여 제공한 (결과물) 찾기
    const offers = await Offer.find({ expertID }).distinct("_id");
    const promotions = await Promotion.find({ offerID: { $in: offers }, status: "DONE" })
      .populate([{ path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] }])
      .sort({ createdAt: -1 })
      .limit(4);
    // 전문가 아이디기준 Review 찾기
    const reviews = await Review.find({ expertID: expert }).sort({ createdAt: -1 }).populate("musicianID");
    const reviewsLen = reviews.length;
    let averageRate = 0;
    let totalRate = 0;
    const eachRateCount = {};
    reviews.forEach((x) => {
      // 리뷰 총 별점 평균 계산
      totalRate += x.rate;
      averageRate = totalRate / reviewsLen;

      // 각 점수별 평균
      eachRateCount[x.rate] = (eachRateCount[x.rate] || 0) + 1 / reviewsLen;
    });
    await User.findByIdAndUpdate(expertID, { averageRate });

    let likeBool = false;
    let likeID;
    expert.likeID.forEach((x) => {
      if (x.fromUser.includes(req.user._id)) {
        likeBool = true;
        likeID = x._id;
      }
    });
    res.render("usersMusician/expertDetail", { pageType, expert, promotions, reviewsLen, averageRate, eachRateCount, reviews, likeBool, likeID });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Chat [공통 pug 사용]
export const getChat = async (req, res) => {
  try {
    const chats = await Chat.find({ musicianID: req.user._id })
      .sort({ createdAt: -1 })
      .populate([
        { path: "musicianID", model: "User" },
        { path: "expertID", model: "User" },
      ]);
    chats.forEach((x) => {
      if (x.talk) {
        x.talk = x.talk.trim();
        const talkArr = x.talk.split(">");
        for (let i = talkArr.length - 1; i >= 0; i -= 1) {
          if (talkArr[i].includes('<li class="body__chat-item chat__expert"')) {
            x.lastMessage = talkArr[i + 1].split("</li")[0];
            break;
          }
        }
      }
    });
    res.render("users/chat", { chats });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Payment
export const getPayment = async (req, res) => {
  try {
    const {
      query: { limit },
    } = req;
    const transactionQuery = { musicianID: req.user._id, type: { $ne: "subscribe" }, status: "successful" };
    const [transactionHistories, transactionCount] = await Promise.all([
      Purchase.find(transactionQuery)
        .populate([
          { path: "feedbackID", model: "Feedback" },
          { path: "promotionID", model: "Promotion" },
          { path: "mixmasterID", model: "MixMaster" },
        ])
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(req.skip)
        .exec(),
      Purchase.countDocuments(transactionQuery),
    ]);
    const transactionPageCount = Math.ceil(transactionCount / limit);
    const transactionPages = paginate.getArrayPages(req)(10, transactionPageCount, req.query.page);

    const page2 = req.query.page2;
    const rawRecurringPages = [];
    const RecurringQuery = { musicianID: req.user._id, type: "subscribe", status: "successful" };
    const [recurringHistories, recurringCount] = await Promise.all([
      Purchase.find(RecurringQuery)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(page2 * limit - limit)
        .exec(),
      Purchase.countDocuments(RecurringQuery),
    ]);
    const recurringPageCount = Math.ceil(recurringCount / limit);
    for (let i = 0; i < recurringPageCount; i += 1) {
      rawRecurringPages.push({ number: i + 1, url: `/user-musician/payment?page2=${i + 1}&page=${req.query.page}&limit=${limit}` });
    }
    let recurringPages = [];
    if (recurringPageCount > 10) {
      // 페이지가 11개 이상일 경우
      let startNumber;
      let finishNumber;
      if (page2 < 6) {
        startNumber = 1;
        finishNumber = 10;
      } else if (rawRecurringPages.length - page2 < 6) {
        finishNumber = rawRecurringPages.length;
        startNumber = finishNumber - 9;
      } else {
        startNumber = page2 - 4;
        finishNumber = startNumber + 9;
      }
      for (let i = startNumber; i < finishNumber + 1; i += 1) {
        recurringPages.push(rawRecurringPages[i - 1]);
      }
    } else {
      // 페이지가 10개 이하일 경우
      recurringPages = rawRecurringPages;
    }

    res.render("usersMusician/payment", {
      recurringPages,
      page2,
      limit,
      transactionHistories,
      transactionCount,
      transactionPageCount,
      transactionPages,
      recurringHistories,
      recurringCount,
      recurringPageCount,
      recurringPages,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Profile [공통 pug 사용]
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render("users/profile", { user, type: "musician" });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

export const postUpdateProfile = async (req, res) => {
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
    const md = new MobileDetect(req.headers["user-agent"]);
    const mbCheck = md.mobile();

    socialArr.forEach((x) => {
      body[x.rawName].forEach((y) => {
        // pc일때
        if (!mbCheck) {
          if (body[x.rawName][0] !== "" || body[x.rawName][1] !== "") {
            body[x.name] = body[x.rawName][0];
          } else if (body[x.rawName][0] === "" && body[x.rawName][1] === "") {
            body[x.name] = "";
          }
        } else {
          if (body[x.rawName][0] !== "" || body[x.rawName][1] !== "") {
            body[x.name] = body[x.rawName][1];
          } else if (body[x.rawName][0] === "" && body[x.rawName][1] === "") {
            body[x.name] = "";
          }
        }
      });
    });
    body.emailSubscription = body.emailSubscription === "on" ? true : false;
    body.targetCountry = Array.isArray(body.targetCountry) ? body.targetCountry : [body.targetCountry];
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    body.youtubeMusicVideo = body.youtubeMusicVideo === "" ? "" : body.youtubeMusicVideo && !body.youtubeMusicVideo.split("/")[3] ? body.youtubeMusicVideo : body.youtubeMusicVideo && body.youtubeMusicVideo.split("/")[3] ? body.youtubeMusicVideo.split("/")[3] : "";
    await User.findByIdAndUpdate(req.user._id, body);

    res.send(`<script>alert("Profile updated successfully."); \
    location.href="${routes.userMusician}${routes.profile}"</script>`);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Change Password [공통 pug 사용]
export const getChangePW = (req, res) => {
  try {
    res.render("users/changePW");
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postChangePW = (req, res, next) => {
  try {
    const { body } = req;
    passport.authenticate("local", async (err, user) => {
      if (!user) {
        res.send(
          `<script>alert("The Current Password was not entered correctly. Please retype your password."); \
            location.href="${routes.userMusician}${routes.changePW}"</script>`
        );
      } else {
        const users = await User.findById(req.user._id);
        await users.setPassword(body.newPW);
        await users.save();

        res.send(`\
        <script>alert("Your password has been reset successfully.");\
        location.href="${routes.userMusician}${routes.changePW}";</script>\
      `);
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

// Reception
export const getReception = async (req, res) => {
  try {
    const {
      params: { requestedID },
      query: { type },
    } = req;

    // 모바일 체크
    const md = new MobileDetect(req.headers["user-agent"]);
    const mbCheck = md.mobile();

    let receptions;
    if (type === "feedback") {
      receptions = await Feedback.findById(requestedID).populate([{ path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] }]);
    } else if (type === "promotion") {
      receptions = await Promotion.findById(requestedID).populate([{ path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] }]);
    } else {
      receptions = await MixMaster.findById(requestedID).populate([{ path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] }]);
    }
    res.render("usersMusician/reception", { receptions, type, mbCheck });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Expert Review
export const getExpertReview = async (req, res) => {
  try {
    const {
      params: { expertID },
    } = req;
    const pageType = "review";
    const expert = await User.findById(expertID).populate("likeID");

    // 전문가 아이디 기준 Review 찾기
    const reviews = await Review.find({ expertID: expert._id }).sort({ createdAt: -1 }).populate("musicianID");
    const reviewsLen = reviews.length;
    let averageRate = 0;
    let totalRate = 0;
    const eachRateCount = {};
    // 전문가에게 받은 offer 개수별 리뷰작성 가능
    const offerIDs = await Offer.find({ expertID }).distinct("_id");
    const feedbacks = await Feedback.find({ musicianID: req.user._id, status: "DONE", offerID: { $in: offerIDs } });
    const promotions = await Promotion.find({ musicianID: req.user._id, status: "DONE", offerID: { $in: offerIDs } });
    const mixmasters = await MixMaster.find({ musicianID: req.user._id, status: "DONE", offerID: { $in: offerIDs } });

    const offerdSeviceLen = feedbacks.length + promotions.length + mixmasters.length;
    const myWrittenReviews = await Review.find({ expertID: expert._id, musicianID: req.user._id });

    if (offerdSeviceLen === myWrittenReviews.length) {
      res.send(`\
        <script>alert("You can only leave one review per service.");\
        location.href="${routes.userMusician}${routes.expertDetail}/${expertID}";</script>\
      `);
    } else {
      reviews.forEach((x) => {
        // 리뷰 총 별점 평균 계산
        totalRate += x.rate;
        averageRate = totalRate / reviewsLen;

        // 각 점수별 평균
        eachRateCount[x.rate] = (eachRateCount[x.rate] || 0) + 1 / reviewsLen;
      });
      await User.findByIdAndUpdate(expertID, { averageRate });
      let likeBool = false;
      let likeID;
      expert.likeID.forEach((x) => {
        if (x.fromUser.includes(req.user._id)) {
          likeBool = true;
          likeID = x._id;
        }
      });
      res.render("usersMusician/expertDetail", { expert, reviews, pageType, averageRate, eachRateCount, reviewsLen, likeBool, likeID });
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postExpertReview = async (req, res) => {
  try {
    const { body } = req;

    body.createdAt = moment(new Date()).tz("Asia/Seoul");
    body.musicianID = req.user._id;

    await Review.create(body);

    const reviews = await Review.find({ expertID: body.expertID });

    const reviewsLen = reviews.length;
    let averageRate = 0;
    let totalRate = 0;
    reviews.forEach((x) => {
      // 리뷰 총 별점 평균 계산
      totalRate += x.rate;
      averageRate = totalRate / reviewsLen;
    });
    await User.findByIdAndUpdate(body.expertID, { averageRate });
    const expert = await User.findById(body.expertID);
    // 알림 생성
    const alarmDesc = "You've got a new review on your service.";
    const alarmLink = `${routes.userMusician}${routes.expertDetail}/${expert._id}`;
    // const
    res.locals.sendAlarm(expert._id, alarmDesc, alarmLink);
    // ========================================
    // 뮤지션이 전문가에게 리뷰남겼을 때 해당전문가에게 메일전송
    // 제목
    const subject = `[CHARTIN] ${expert.name}, you've got a review from a musician`;
    // 인사말
    const greetings = `Hi, CHARTIN Professional ${expert.name}, `;
    const desc = `Good news!
    The musician you worked with has left a review.
    Check out the review now and see the difference you made.
    Let's get higher!`;
    res.locals.sendEmail(expert.userID, subject, greetings, desc);
    // =========================================

    res.send(`<script>alert("Successfully done!"); \
    location.href="${routes.userMusician}${routes.expertDetail}/${body.expertID}"</script>`);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
