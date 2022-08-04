import paginate from "express-paginate";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import moment from "moment-timezone";
import passport from "passport";
import MobileDetect from "mobile-detect";
import routes from "../routes";
import User from "../models/User";
import Chat from "../models/Chat";
import Feedback from "../models/Feedback";
import Promotion from "../models/Promotion";
import MixMaster from "../models/MixMaster";
import Offer from "../models/Offer";
import Proposal from "../models/Proposal";
import Review from "../models/Review";
import Save from "../models/Save";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Only Expert Dashboard [전문가 대시보드 하위 페이지만 작성]

// My Studio
export const getMyStudio = async (req, res) => {
  try {
    const totalRequests = [];

    // 내가 남긴 feedback, 제안한 promotion, mixmaster
    const offers = await Offer.find({ expertID: req.user._id }).distinct("_id");
    const proposals = await Proposal.find({ expertID: req.user._id }).distinct("_id");
    const feedbacks = await Feedback.find({ offerID: { $in: offers } }).populate([
      { path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] },
      {
        path: "musicianID",
        model: "User",
      },
    ]);
    const promotions = await Promotion.find({ proposalID: { $in: proposals } }).populate([
      { path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] },
      {
        path: "musicianID",
        model: "User",
      },
    ]);
    const mixmasters = await MixMaster.find({ proposalID: { $in: proposals } }).populate([
      { path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] },
      {
        path: "musicianID",
        model: "User",
      },
    ]);

    feedbacks.forEach((x) => {
      totalRequests.push(x);
    });
    promotions.forEach((x) => {
      totalRequests.push(x);
    });
    mixmasters.forEach((x) => {
      totalRequests.push(x);
    });
    totalRequests.sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const completedRequests = [];
    const requested = [];
    totalRequests.forEach((x) => {
      if (x.status === "RESULT" || x.status === "DONE") completedRequests.push(x);
    });

    const reviewsNumber = await Review.countDocuments({ expertID: req.user._id });

    res.render("usersExpert/myStudio", { totalRequests, completedRequests, reviewsNumber, requested });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Manage Request
export const getManageRequest = async (req, res) => {
  try {
    const {
      query: { type, id },
    } = req;
    let totalManageRequest;

    if (type && id) {
      if (type === "feedback") {
        totalManageRequest = await Feedback.find({ offerID: id }).populate([
          { path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] },
          {
            path: "musicianID",
            model: "User",
          },
        ]);
      } else if (type === "promotion") {
        totalManageRequest = await Promotion.find({ $or: [{ proposalID: id }, { expertID: req.user._id }] }).populate([
          { path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] },
          {
            path: "musicianID",
            model: "User",
          },
          { path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] },
        ]);
      } else {
        totalManageRequest = await MixMaster.find({ $or: [{ proposalID: id }, { expertID: req.user._id }] }).populate([
          { path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] },
          {
            path: "musicianID",
            model: "User",
          },
          { path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] },
        ]);
      }
      res.render("usersExpert/manageRequest", { totalManageRequest, pagination: false });
    } else {
      const manageRequest = [];

      // 내가 남긴 feedback, 제안한 promotion, mixmaster
      const offers = await Offer.find({ expertID: req.user._id }).distinct("_id");
      const proposals = await Proposal.find({ expertID: req.user._id }).distinct("_id");
      const feedbacks = await Feedback.find({ offerID: { $in: offers } }).populate([
        { path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] },
        {
          path: "musicianID",
          model: "User",
        },
      ]);
      const promotions = await Promotion.find({ $or: [{ proposalID: { $in: proposals } }, { expertID: req.user._id }] }).populate([
        { path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] },
        {
          path: "musicianID",
          model: "User",
        },
        { path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] },
      ]);
      const mixmasters = await MixMaster.find({ $or: [{ proposalID: { $in: proposals } }, { expertID: req.user._id }] }).populate([
        { path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] },
        {
          path: "musicianID",
          model: "User",
        },
        { path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] },
      ]);

      feedbacks.forEach((x) => {
        manageRequest.push(x);
      });
      promotions.forEach((x) => {
        manageRequest.push(x);
      });
      mixmasters.forEach((x) => {
        manageRequest.push(x);
      });
      manageRequest.sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      const page = req.query.page;
      const limit = req.query.limit;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const totalCount = manageRequest.length;
      totalManageRequest = manageRequest.slice(startIndex, endIndex);
      const pageCount = Math.ceil(totalCount / req.query.limit);
      const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);
      res.render("usersExpert/manageRequest", { totalManageRequest, totalCount, pageCount, pages, limit, pagination: true });
    }
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
    const chats = await Chat.find({ expertID: req.user._id })
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
          if (talkArr[i].includes('<li class="body__chat-item chat__musician"')) {
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

// Withdrawal
export const getWithdrawal = async (req, res) => {
  try {
    const {
      query: { limit },
    } = req;
    const totalRequests = [];

    // 내가 남긴 feedback, 제안한 promotion, mixmaster
    const offers = await Offer.find({ expertID: req.user._id }).distinct("_id");
    const proposals = await Proposal.find({ expertID: req.user._id }).distinct("_id");
    const feedbacks = await Feedback.find({ offerID: { $in: offers } }).populate([
      { path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] },
      {
        path: "musicianID",
        model: "User",
      },
    ]);
    const promotions = await Promotion.find({ proposalID: { $in: proposals } }).populate([
      { path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] },
      {
        path: "musicianID",
        model: "User",
      },
    ]);
    const mixmasters = await MixMaster.find({ proposalID: { $in: proposals } }).populate([
      { path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] },
      {
        path: "musicianID",
        model: "User",
      },
    ]);

    feedbacks.forEach((x) => {
      totalRequests.push(x);
    });
    promotions.forEach((x) => {
      totalRequests.push(x);
    });
    mixmasters.forEach((x) => {
      totalRequests.push(x);
    });
    totalRequests.sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const completedRequests = [];
    totalRequests.forEach((x) => {
      if (x.status === "DONE") completedRequests.push(x);
    });

    // 해당 전문가와 연관된 리뷰 개수
    const reviews = await Review.find({ expertID: req.user._id });

    // 결제와 인출 내역
    const transactionQuery = { expertID: req.user._id };
    const [transactionHistories, transactionCount] = await Promise.all([Save.find(transactionQuery).sort({ createdAt: -1 }).limit(limit).skip(req.skip).exec(), Save.countDocuments(transactionQuery)]);
    const transactionPageCount = Math.ceil(transactionCount / limit);
    const transactionPages = paginate.getArrayPages(req)(10, transactionPageCount, req.query.page);

    let totalBalance = 0;
    transactionHistories.forEach((x) => {
      totalBalance += x.amount;
    });
    res.render("usersExpert/withdrawal", { limit, totalBalance, totalRequests, completedRequests, reviews, transactionHistories, transactionCount, transactionPageCount, transactionPages });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postWithdrawal = async (req, res) => {
  try {
    const { body } = req;
    const today = moment(new Date()).tz("Asia/Seoul");

    await Save.create({
      status: "Pending Approval",
      type: "minus",
      requestType: "Withdrawal",
      musicianName: "-",
      expertID: req.user._id,
      createdAt: today,
      amount: -body.amount,
      company: body.company,
      accountEmail: body.accountEmail,
      vat: body.vat,
      bankName: body.bankName,
      accountHolder: body.accountHolder,
      accountNumber: body.accountNumber,
      address: body.address,
      searchByMonth: today.format("YYYY-MM"),
    });

    res.send(`<script>alert("Withdrawl request processed successfully. You'll be paid in our upcoming pay cycle. For more information, please make an inquiry to our chatbot - Dino."); \
    location.href="${routes.userExpert}${routes.withdrawal}"</script>`);
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
    res.render("users/profile", { user, type: "expert" });
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
    body.serviceCountry = Array.isArray(body.serviceCountry) ? body.serviceCountry : [body.serviceCountry];
    body.providableServices = Array.isArray(body.providableServices) ? body.providableServices : [body.providableServices];
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");

    await User.findByIdAndUpdate(req.user._id, body);

    res.send(`<script>alert("Profile updated successfully."); \
    location.href="${routes.userExpert}${routes.profile}"</script>`);
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
            location.href="${routes.userExpert}${routes.changePW}"</script>`
        );
      } else {
        const users = await User.findById(req.user._id);
        await users.setPassword(body.newPW);
        await users.save();

        res.send(`\
        <script>alert("Your password has been reset successfully.");\
        location.href="${routes.userExpert}${routes.changePW}";</script>\
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

// promotion mixmaster upload page
export const getUpload = async (req, res) => {
  try {
    const {
      params: { requestedID },
      query: { type },
    } = req;

    if (type === "promotion") {
      const promotion = await Promotion.findOne({ _id: requestedID, title: type });
      if (promotion.length !== 0) {
        res.render("usersExpert/upload", { requestedID, type });
      }
    } else {
      const mixmaster = await MixMaster.findOne({ _id: requestedID, title: type });
      if (mixmaster.length !== 0) {
        res.render("usersExpert/upload", { requestedID, type });
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
export const postUpload = async (req, res) => {
  try {
    const { body } = req;

    body.createdAt = moment(new Date()).tz("Asia/Seoul");
    body.expertID = req.user._id;
    const offer = await Offer.create(body);

    // 메일전송 변수
    let musician;
    let subject;
    let greetings;
    let desc;
    if (body.type === "promotion") {
      musician = await Promotion.findByIdAndUpdate(body.requestedID, { $push: { offerID: offer._id }, status: "RESULT" }).populate([
        { path: "musicianID", model: "User" },
        { path: "proposalID", model: "Proposal" },
      ]);
      // 알림 생성
      const alarmDesc = "Your Promotion service status has been updated to Result.";
      const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=promotion&id=${musician._id}`;
      const alarmManageRequestLink = `${routes.userExpert}${routes.manageRequest}?type=promotion&id=${musician.proposalID[0]._id}`;
      res.locals.sendAlarm(musician.musicianID[0]._id, alarmDesc, alarmMyRequestLink);
      res.locals.sendAlarm(req.user._id, alarmDesc, alarmManageRequestLink);
      // ========================================
      // 제안받은 프로모션중 선택된 프로모션의 전문가가 결과물업로드시
      // 제목
      subject = `[CHARTIN] ${musician.musicianID[0].name}, your service status has been updated on CHARTIN`;
      // 인사말
      greetings = `Hi, CHARTIN Winner ${musician.musicianID[0].name}, `;
      desc = `Your promotion service status has been updated.
          Check out the status now and chat with the experts if you have any question.
          Let's get higher! `;
      // =========================================
    } else {
      musician = await MixMaster.findByIdAndUpdate(body.requestedID, { $push: { offerID: offer._id }, status: "RESULT" }).populate([
        { path: "musicianID", model: "User" },
        { path: "proposalID", model: "Proposal" },
      ]);
      // 알림 생성
      const alarmDesc = "Your Mix/Master service status has been updated to Result.";
      const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=mixmaster&id=${musician._id}`;
      const alarmManageRequestLink = `${routes.userExpert}${routes.manageRequest}?type=mixmaster&id=${musician.proposalID[0]._id}`;
      res.locals.sendAlarm(musician.musicianID[0]._id, alarmDesc, alarmMyRequestLink);
      res.locals.sendAlarm(req.user._id, alarmDesc, alarmManageRequestLink);
      // ========================================
      // 제안받은 믹스마스터 중 선택된 믹스마스터의 전문가가 결과물업로드시
      // 제목
      subject = `[CHARTIN] ${musician.musicianID[0].name}, your service status has been updated on CHARTIN`;
      // 인사말
      greetings = `Hi, CHARTIN Winner ${musician.musicianID[0].name}, `;

      desc = `Your Mix/Master service status has been updated.
        Check out the status now and chat with the experts if you have any question.
        Let's get higher!`;
      // =========================================
    }
    res.locals.sendEmail(musician.musicianID[0].userID, subject, greetings, desc);

    res.send(`<script>alert("Upload Successful."); \
    location.href="${routes.userExpert}${routes.manageRequest}"</script>`);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
