import paginate from "express-paginate";
import express from "express";
import routes from "../routes";
import {
  home,
  getMainVideoDetail,
  getMostVideoDetail,
  getOfferdVideoDetail,
  newsRoom,
  getNewsRoomDetail,
  conferenceRoom,
  postConferenceRoom,
  getConferenceRoomDetail,
  postConferenceRoomUpdate,
  getConferenceRoomDelete,
  postComment,
  musicianList,
  getMusicianListType,
  getMusicianListDetail,
  postProposalAndOffer,
  getPrivacyPolicy,
  getTermsOfUse,
  getLegalNotice,
  getPricing,
} from "../controllers/globalController";
import { onlyExpert, onlyUser, uploadPromotionFilePic } from "../middlewares";

const globalRouter = express.Router();

// 홈 Home
globalRouter.get(routes.home, home);

// Main Video Detail
globalRouter.get(`${routes.mainVideoDetail}/:videoID`, getMainVideoDetail);
// Most Video Detail
globalRouter.get(`${routes.mostVideoDetail}/:videoID`, getMostVideoDetail);
// Offered Promotion Video Detail
globalRouter.get(`${routes.offerdVideoDetail}`, getOfferdVideoDetail);

// 뉴스 룸 News Room
globalRouter.get(routes.newsRoom, newsRoom);
globalRouter.get(`${routes.newsRoom}/detail/:newsID`, getNewsRoomDetail);

// 컨퍼런스 룸 Conference Room
globalRouter.get(routes.conferenceRoom, conferenceRoom);
globalRouter.post(routes.conferenceRoom, postConferenceRoom);
globalRouter.get(`${routes.conferenceRoom}/detail/:conferenceID`, getConferenceRoomDetail);
globalRouter.post(`${routes.conferenceRoom}/update/:conferenceID`, postConferenceRoomUpdate);
globalRouter.get(`${routes.conferenceRoom}/delete/:conferenceID`, getConferenceRoomDelete);
globalRouter.post(`${routes.conferenceRoom}/detail/:conferenceID`, postComment);

// 뮤지션 리스트 Musician List
globalRouter.get(routes.musicianList, onlyExpert, musicianList);
globalRouter.get(`${routes.musicianList}/type`, onlyExpert, paginate.middleware(20, 50), getMusicianListType);
globalRouter.get(`${routes.musicianList}/detail/:requestedID/:musicianID`, onlyUser, getMusicianListDetail);
// 피드백 => offer / 프로모션, 믹스마스터 => proposal
globalRouter.post(`${routes.musicianList}/detail/:requestedID`, onlyExpert, uploadPromotionFilePic, postProposalAndOffer);

// Privacy Policy, Terms Of Use, Legal Notice
globalRouter.get(routes.privacyPolicy, getPrivacyPolicy);
globalRouter.get(routes.termsOfUse, getTermsOfUse);
globalRouter.get(routes.legalNotice, getLegalNotice);

// TODO: pricing page
// Pricing
globalRouter.get(routes.pricing, getPricing);

export default globalRouter;
