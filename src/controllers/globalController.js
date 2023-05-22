import paginate from "express-paginate";
import moment from "moment-timezone";
import MobileDetect from "mobile-detect";
import routes from "../routes";
import News from "../models/News";
import NewsCategory from "../models/NewsCategory";
import Conference from "../models/Conference";
import ConferenceLike from "../models/ConferenceLike";
import Comment from "../models/Comment";
import MainVideo from "../models/MainVideo";
import MostVideo from "../models/MostVideo";
import PartnerLogo from "../models/PartnerLogo";
import Feedback from "../models/Feedback";
import Promotion from "../models/Promotion";
import MixMaster from "../models/MixMaster";
import User from "../models/User";
import Like from "../models/Like";
import Proposal from "../models/Proposal";
import Offer from "../models/Offer";
import Recomment from "../models/Recomment";

// 홈 Home
export const home = async (req, res) => {
  try {
    // 모바일 체크
    const md = new MobileDetect(req.headers["user-agent"]);
    const mbCheck = md.mobile();

    // Main Video / Most Watched Video / NewsRoom / Partner Logo
    const mainVideos = await MainVideo.find({}).populate("expertID");
    const mostVideos = await MostVideo.find({ status: true }).sort({ createdAt: -1 });
    // 뉴스 콘텐츠
    const newsContents = await News.find({ hide: false }).sort({ createdAt: -1 }).limit(8);
    // 파트너 로고
    const partners = await PartnerLogo.find({});

    // 쿠키 Accept 여부 확인
    const cookieExist = req.cookies.privacyCookie;

    res.render("home", { mbCheck, mainVideos, mostVideos, newsContents, partners, cookieExist });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Main Video Detail
export const getMainVideoDetail = async (req, res) => {
  try {
    const {
      params: { videoID },
    } = req;
    const video = await MainVideo.findById(videoID).populate("expertID");
    const mostVideos = await MostVideo.find({ status: true }).populate("expertID");
    res.render("videoDetail", { video, mostVideos });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// Most Video Detail
export const getMostVideoDetail = async (req, res) => {
  try {
    const {
      params: { videoID },
    } = req;

    const video = await MostVideo.findById(videoID).populate("expertID");
    const mostVideos = await MostVideo.find({ $and: [{ _id: { $ne: videoID } }, { status: true }] }).populate("expertID");
    res.render("videoDetail", { video, mostVideos });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
// Offered Promotion Video Detail
export const getOfferdVideoDetail = async (req, res) => {
  try {
    const {
      query: { url },
    } = req;

    const video = await Offer.findOne({ contentLink: url }).populate("expertID");
    const mostVideos = await MostVideo.find({}).populate("expertID");
    res.render("videoDetail", { video, mostVideos });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 뉴스 룸 News Room
export const newsRoom = async (req, res) => {
  try {
    const {
      query: { category, region },
    } = req;

    let findQuery = { hide: false };
    if (category) {
      findQuery["newsCategoryID"] = category;
    }
    if (region && region !== "World") {
      findQuery["region"] = region;
    }

    const newsContents = await News.find(findQuery).sort({ createdAt: -1 });
    const newsCategories = await NewsCategory.find();
    res.render("newsRoom", { category, newsContents, newsCategories, region });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const getNewsRoomDetail = async (req, res) => {
  try {
    const {
      params: { newsID },
    } = req;

    const newsContents = await News.findById(newsID);
    const allNews = await News.find({ hide: false }).sort({ createdAt: -1 });
    const backNews = [];
    const nextNews = [];
    allNews.forEach((x, i) => {
      if (x._id.toString() === newsID.toString()) {
        if (i === 0) {
          nextNews.push(allNews[i + 1]);
        } else if (i === allNews.length - 1) {
          backNews.push(allNews[i - 1]);
        } else {
          backNews.push(allNews[i - 1]);
          nextNews.push(allNews[i + 1]);
        }
      }
    });
    res.render("newsRoomDetail", { newsContents, backNews, nextNews });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 컨퍼런스 룸 Conference Room
export const conferenceRoom = async (req, res) => {
  try {
    const {
      query: { category, search },
    } = req;

    let findQuery;
    if (!category && !search) {
      findQuery = {};
    } else if (category && !search) {
      findQuery = { category: category };
    } else if (!category && search) {
      findQuery = { $or: [{ title: { $regex: search, $options: "i" } }, { desc: { $regex: search, $options: "i" } }] };
    }

    const conferences = await Conference.find(findQuery)
      .populate([
        { path: "userID", model: "User", populate: [{ path: "likeID", model: "Like" }] },
        { path: "conferenceLikeID", model: "ConferenceLike" },
      ])
      .sort({ createdAt: -1 });

    //  로그인한 유저가 해당 컨퍼런스 작성자 좋아요 눌렀을 때(유저 좋아요)
    const toUserArr = [];
    if (req.user) {
      const likes = await Like.find({ fromUser: req.user._id });
      likes.forEach((x) => {
        toUserArr.push(x.toUser[0].toString());
      });
    }

    // 로그인한 유저가 해당 컨퍼런스 좋아요 눌렀을 때(컨퍼런스 자체 좋아요)
    const conferenceLikeIDArr = [];
    if (req.user) {
      const conferenceLikes = await ConferenceLike.find({ fromUser: req.user._id }).populate("conferenceID");
      conferenceLikes.forEach((x) => {
        conferenceLikeIDArr.push(x.conferenceID[0]._id.toString());
      });
    }
    res.render("conferenceRoom", { conferences, conferenceLikeIDArr, toUserArr });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postConferenceRoom = async (req, res) => {
  try {
    const {
      body,
      query: { category },
    } = req;
    const today = moment(new Date()).tz("Asia/Seoul");
    body.createdAt = today;
    body.updatedAt = today;
    await Conference.create(body);
    if (body.category === 1) {
      res.send(`<script>alert("Question posted successfully.");\
  location.href="${routes.conferenceRoom}"</script>`);
    } else if (body.category > 1) {
      res.send(`<script>alert("Question posted successfully.");\
  location.href="${routes.conferenceRoom}?category=${body.category}"</script>`);
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const getConferenceRoomDetail = async (req, res) => {
  try {
    const {
      params: { conferenceID },
    } = req;

    const conference = await Conference.findById(conferenceID).populate("userID");
    const comments = await Comment.find({ conferenceID })
      .populate([
        { path: "userID", model: "User" },
        { path: "recommentID", model: "Recomment", populate: [{ path: "userID", model: "User" }] },
      ])
      .sort({ createdAt: -1 });

    // 컨퍼런스 작성한 유저와 로그인유저가 같은지 판별
    let conferenceOwner = false;
    if (req.user) {
      if (conference.userID[0]._id.toString() === req.user._id.toString()) {
        conferenceOwner = true;
      }
    }

    let conferenceUserLikeBool = false;
    let commentLikeArr = [];
    if (req.user) {
      const likes = await Like.find({ fromUser: req.user._id });
      likes.forEach((x) => {
        if (x.toUser[0].toString() === conference.userID[0]._id.toString()) {
          conferenceUserLikeBool = true;
        }
        commentLikeArr.push(x.toUser[0].toString());
      });
    }
    // 컨퍼런스 자체 좋아요
    let likeBool;
    if (req.user) {
      likeBool = false;
      const conferenceLike = await ConferenceLike.find({ fromUser: req.user._id, conferenceID });
      if (conferenceLike.length !== 0) {
        likeBool = true;
      }
    }

    res.render("conferenceRoomDetail", { conference, comments, likeBool, conferenceUserLikeBool, commentLikeArr, conferenceOwner });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postConferenceRoomUpdate = async (req, res) => {
  try {
    const {
      body,
      params: { conferenceID },
    } = req;

    const today = moment(new Date()).tz("Asia/Seoul");
    await Conference.updateOne({ _id: conferenceID }, { conferenceFile: body.conferenceFile, title: body.title, desc: body.desc, category: body.category, updatedAt: today });

    res.send(`<script>alert("Question updated successfully.");\
    location.href="${routes.conferenceRoom}/detail/${conferenceID}"</script>`);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

export const getConferenceRoomDelete = async (req, res) => {
  try {
    const {
      params: { conferenceID },
    } = req;

    await ConferenceLike.deleteMany({ conferenceID });

    const comments = await Comment.find({ conferenceID }).distinct("_id");
    await Recomment.deleteMany({ commentID: { $in: comments } });
    await Comment.deleteMany({ conferenceID });
    await Conference.findByIdAndDelete(conferenceID);

    res.send(
      `<script>alert("Deleted.");\
      location.href="${routes.conferenceRoom}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postComment = async (req, res) => {
  try {
    const {
      params: { conferenceID },
      body,
    } = req;

    const today = moment(new Date()).tz("Asia/Seoul");
    body.createdAt = today;
    body.updatedAt = today;
    body.conferenceID = conferenceID;
    const commentID = await Comment.create(body);
    const conferences = await Conference.findById(conferenceID).populate("userID");
    await Conference.findByIdAndUpdate(conferenceID, { $push: { commentID } });
    // 알림 생성
    const alarmDesc = "You've got a new comment.";
    const alarmConferenceLink = `${routes.conferenceRoom}/detail/${conferenceID}`;
    res.locals.sendAlarm(conferences.userID[0]._id, alarmDesc, alarmConferenceLink);
    res.send(`<script>location.href="${routes.conferenceRoom}/detail/${conferenceID}"</script>`);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// 뮤지션 리스트 Musician List
export const musicianList = async (req, res) => {
  try {
    // Feedback / Promotion / MixMaster
    const feedbacks = await Feedback.find({ offerID: { $not: { $size: 3 } }, $or: [{ status: "REQUESTED" }, { status: "IN PROGRESS" }] })
      .populate([
        { path: "musicianID", model: "User" },
        { path: "offerID", model: "Offer" },
      ])
      .sort({ createdAt: -1 })
      .limit(8);
    const promotions = await Promotion.find({ proposalID: { $not: { $size: 5 } }, $or: [{ status: "REQUESTED" }, { status: "PROPOSAL" }] })
      .populate([
        { path: "musicianID", model: "User" },
        { path: "proposalID", model: "Proposal" },
      ])
      .sort({ createdAt: -1 })
      .limit(8);
    const mixmasters = await MixMaster.find({ proposalID: { $not: { $size: 5 } }, $or: [{ status: "REQUESTED" }, { status: "PROPOSAL" }] })
      .populate([
        { path: "musicianID", model: "User" },
        { path: "proposalID", model: "Proposal" },
      ])
      .sort({ createdAt: -1 })
      .limit(8);
    res.render("musicianList", { feedbacks, promotions, mixmasters });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const getMusicianListType = async (req, res) => {
  try {
    const {
      query: { type, country, genre },
    } = req;

    // 미들웨어 변수 country와 겹처서 변형함
    const currentCountry = country;

    // musician 국가, 장르별로 필터링할 변수
    let musicianFilter;
    if (currentCountry && genre) {
      musicianFilter = await User.find({ role: "musician", $and: [{ currentCountry }, { genre }] }).distinct("_id");
    } else if (!currentCountry && genre) {
      musicianFilter = await User.find({ role: "musician", genre }).distinct("_id");
    } else if (currentCountry && !genre) {
      musicianFilter = await User.find({ role: "musician", currentCountry }).distinct("_id");
    } else {
      musicianFilter = await User.find({ role: "musician" }).distinct("_id");
    }

    if (!musicianFilter) {
      console.log("empty");
    } else {
      console.log("no empty");
    }
    // Feedback / Promotion / MixMaster
    let requestedList;
    let totalCount;
    if (type === "feedback") {
      [requestedList, totalCount] = await Promise.all([
        Feedback.find({ offerID: { $not: { $size: 3 } }, $or: [{ status: "IN PROGRESS" }, { status: "REQUESTED" }], musicianID: { $in: musicianFilter } })
          .populate("musicianID")
          .sort({ createdAt: -1 })
          .limit(req.query.limit)
          .skip(req.skip)
          .exec(),
        Feedback.countDocuments({ offerID: { $not: { $size: 3 } }, $or: [{ status: "IN PROGRESS" }, { status: "REQUESTED" }] }),
      ]);
    } else if (type === "promotion") {
      [requestedList, totalCount] = await Promise.all([
        Promotion.find({ proposalID: { $not: { $size: 5 } }, $or: [{ status: "PROPOSAL" }, { status: "REQUESTED" }], musicianID: { $in: musicianFilter } })
          .populate("musicianID")
          .sort({ createdAt: -1 })
          .limit(req.query.limit)
          .skip(req.skip)
          .exec(),
        Promotion.countDocuments({ proposalID: { $not: { $size: 5 } }, $or: [{ status: "PROPOSAL" }, { status: "REQUESTED" }] }),
      ]);
    } else {
      [requestedList, totalCount] = await Promise.all([
        MixMaster.find({ proposalID: { $not: { $size: 5 } }, $or: [{ status: "PROPOSAL" }, { status: "REQUESTED" }], musicianID: { $in: musicianFilter } })
          .populate("musicianID")
          .sort({ createdAt: -1 })
          .limit(req.query.limit)
          .skip(req.skip)
          .exec(),
        MixMaster.countDocuments({ proposalID: { $not: { $size: 5 } }, $or: [{ status: "PROPOSAL" }, { status: "REQUESTED" }] }),
      ]);
    }
    const pageCount = Math.ceil(totalCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);
    res.render("musicianListType", { requestedList, type, totalCount, pageCount, pages, currentCountry, genre });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const getMusicianListDetail = async (req, res) => {
  try {
    const {
      params: { requestedID, musicianID },
      query: { type },
    } = req;

    const musicians = await User.findById(musicianID).populate("likeID");
    let alreadyProposal = false;
    let requested;
    let hideBtn = false;

    if (type === "feedback") {
      requested = await Feedback.findById(requestedID).populate([{ path: "offerID", model: "Offer", populate: [{ path: "expertID", model: "User" }] }]);
      for (let i = 0; i < requested.offerID.length; i += 1) {
        if (requested.offerID[i].expertID !== null) {
          if (requested.offerID[i].expertID[0]._id.toString() === req.user._id.toString()) {
            alreadyProposal = true;
            break;
          }
        }
      }
      hideBtn = requested.offerID.length === 3;
    } else if (type === "promotion") {
      requested = await Promotion.findById(requestedID).populate([{ path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] }]);
      for (let i = 0; i < requested.proposalID.length; i += 1) {
        if (requested.proposalID[i].expertID[0]._id.toString() === req.user._id.toString()) {
          alreadyProposal = true;
          break;
        }
      }
      hideBtn = requested.proposalID.length === 5;
    } else if (type === "mixmaster") {
      requested = await MixMaster.findById(requestedID).populate([{ path: "proposalID", model: "Proposal", populate: [{ path: "expertID", model: "User" }] }]);
      for (let i = 0; i < requested.proposalID.length; i += 1) {
        if (requested.proposalID[i].expertID[0]._id.toString() === req.user._id.toString()) {
          alreadyProposal = true;
          break;
        }
      }
      hideBtn = requested.proposalID.length === 5;
    }

    let likeBool = false;
    let likeID;
    musicians.likeID.forEach((x) => {
      if (x.fromUser.includes(req.user._id)) {
        likeBool = true;
        likeID = x._id;
      }
    });
    res.render("musicianListDetail", { musicians, requested, type, likeBool, likeID, hideBtn, alreadyProposal });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const postProposalAndOffer = async (req, res) => {
  try {
    const {
      params: { requestedID },
      body,
      file,
    } = req;

    body.createdAt = moment(new Date()).tz("Asia/Seoul");
    body.expertID = req.user._id;
    body.specialize = res.locals.absoluteArr(body.specialize);
    // 메일전송 변수
    let subject; // 제목
    let greetings; // 인사말
    let desc; //내용
    let receiver; //메일받는사람(뮤지션)

    if (body.type === "feedback") {
      // bestFits Others 제거
      if (Array.isArray(body.bestFits)) {
        body.bestFits = body.bestFits.filter(function (item) {
          return item !== "Others";
        });
        body.bestFits.join(", ");
      } else {
        body.bestFits = body.bestFits;
      }
      const offerID = await Offer.create(body);
      const expert = await User.findById(req.user._id);
      receiver = await Feedback.findByIdAndUpdate(requestedID, {
        status: "IN PROGRESS",
        $push: { offerID: { $each: [offerID], $position: 0 }, expertNames: { $each: [expert.name], $position: 0 } },
      }).populate("musicianID");
      // 알림 생성
      const alarmDesc = "Your Feedback service status has been updated to In Progress.";
      const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=feedback&id=${receiver._id}`;
      res.locals.sendAlarm(receiver.musicianID[0]._id, alarmDesc, alarmMyRequestLink);
      if (receiver.offerID.length < 2) {
        const alarmNewDesc = "A new feedback just arrived in your studio. Check it out now.";
        res.locals.sendAlarm(receiver.musicianID[0]._id, alarmNewDesc, alarmMyRequestLink);
        // ========================================
        // 전문가가 피드백 작성 후 제안시 해당 뮤지션에게 이메일 전송
        // 제목
        subject = `[CHARTIN] ${receiver.musicianID[0].name}, a new feedback has arrived.`;
        // 인사말
        greetings = `Hello, ${receiver.musicianID[0].name}, `;
        desc = `Our verified expert left a feedback by your request. You'll receive 3 feedbacks in total.
      Check out the feedback now and plan how you can improve your music!
      Let's get higher!`;
        // =========================================
      } else if (receiver.offerID.length === 2) {
        const alarmLastDesc = "Feedback Service Completed. Time to choose the best feedbacker for reward!";
        res.locals.sendAlarm(receiver.musicianID[0]._id, alarmLastDesc, alarmMyRequestLink);
        // ========================================
        // 전문가가 피드백 작성 후 제안시 해당 뮤지션에게 이메일 전송
        // 제목
        subject = `[CHARTIN] ${receiver.musicianID[0].name}, your last feedback just arrived.`;
        // 인사말
        greetings = `Hello, ${receiver.musicianID[0].name}, `;
        desc = `You've just received your last feedback for your music. Go check all 3 feedbacks out and choose the best one to reward.
        We sincerely hope they can best assist your music activities in the future.
        If you wish to get more feedbacks, simply make a request.
        Other musicians tend to move onto 'Promotion Request' to connect with promotion experts too.
        Anyhow, we wish you best of luck! Speak soon!
        Cheers.`;
        // =========================================
      }
    } else if (body.type === "promotion") {
      body.planFile = file ? file.location : "";
      // specialize Others 제거
      if (Array.isArray(body.specialize)) {
        body.specialize = body.specialize.filter(function (item) {
          return item !== "Others";
        });
        body.specialize.join(", ");
      } else {
        body.specialize = body.specialize;
      }
      const proposalID = await Proposal.create(body);
      receiver = await Promotion.findByIdAndUpdate(requestedID, { $push: { proposalID }, status: "PROPOSAL" }).populate("musicianID");
      // 알림 생성
      // 전문가에게 서비스 제안이 들어왔을 때
      const alarmDesc = "New promotion proposal has just arrived. Check it out now.";
      const alarmLink = `${routes.userMusician}${routes.reception}/${receiver._id}?type=promotion`;
      res.locals.sendAlarm(receiver.musicianID[0]._id, alarmDesc, alarmLink);

      // 서비스 상태 업데이트 알림
      const alarmDesc2 = "Your Promotion service status has been updated to Proposed";
      const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=promotion&id=${receiver._id}`;
      res.locals.sendAlarm(receiver.musicianID[0]._id, alarmDesc2, alarmMyRequestLink);
      // ========================================
      // 전문가가 프로모션 작성 후 제안시 해당 뮤지션에게 이메일 전송
      // 제목
      subject = `[CHARTIN] ${receiver.musicianID[0].name}, you've got a proposal for your Music Promotion`;
      // 인사말
      greetings = `Hello, ${receiver.musicianID[0].name}, `;
      desc = `You've just received a customized proposal for your music promotion.
      Check out the proposal and discuss how your music will be promoted with the experts.
      Let's get higher!`;
      // =========================================
    } else if (body.type === "mixmaster") {
      const proposalID = await Proposal.create(body);
      receiver = await MixMaster.findByIdAndUpdate(requestedID, { $push: { proposalID }, status: "PROPOSAL" }).populate("musicianID");
      // 알림 생성
      // 전문가에게 서비스 제안이 들어왔을 때
      const alarmDesc = "New mix/master proposal has just arrived. Check it out now.";
      const alarmLink = `${routes.userMusician}${routes.reception}/${receiver._id}?type=mixmaster`;
      res.locals.sendAlarm(receiver.musicianID[0]._id, alarmDesc, alarmLink);

      // 서비스 상태 업데이트 알림
      const alarmDesc2 = "Your Mix/Master service status has been updated to Proposed";
      const alarmMyRequestLink = `${routes.userMusician}${routes.myRequest}?type=mixmaster&id=${receiver._id}`;
      res.locals.sendAlarm(receiver.musicianID[0]._id, alarmDesc2, alarmMyRequestLink);
      // ========================================
      // 전문가가 믹스마스터 작성 후 제안시 해당 뮤지션에게 이메일 전송
      // 제목
      subject = `[CHARTIN] ${receiver.musicianID[0].name}, you've got a proposal for your Mix/Master`;
      // 인사말
      greetings = `Hello, ${receiver.musicianID[0].name}, `;
      desc = `You've just received a customized proposal for you to bring your music to the next level!
      Check out the proposal and discuss how you wish your music to be treated with the experts.
      Let's get higher!`;
      // =========================================
    }
    // ========================================
    // 전문가가 프로모션 / 믹스마스터 작성 후 제안시 해당 뮤지션에게 이메일 전송
    res.locals.sendEmail(receiver.musicianID[0].userID, subject, greetings, desc);
    // ========================================
    res.send(`<script>location.href="${routes.musicianList}"</script>`);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Privacy Policy, Terms Of Use, Legal Notice
export const getPrivacyPolicy = (req, res) => {
  try {
    res.render("terms/privacyPolicy");
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const getTermsOfUse = (req, res) => {
  try {
    res.render("terms/termsOfUse");
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
export const getLegalNotice = (req, res) => {
  try {
    res.render("terms/legalNotice");
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};

// Pricing
export const getPricing = (req, res) => {
  try {
    // TODO: faq
    // const faqs = await Faq.find().sort({createdAt:-1});
    res.render("pricing");
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.home}"</script>`
    );
  }
};
