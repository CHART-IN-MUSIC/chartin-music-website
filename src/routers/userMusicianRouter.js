import paginate from "express-paginate";
import express from "express";
import routes from "../routes";
import { getMyStudio, getMyRequest, getExpertDetail, getChat, getPayment, getProfile, postUpdateProfile, getChangePW, postChangePW, getReception, getExpertReview, postExpertReview } from "../controllers/userMusicianController";
import { onlyMusician, onlyUser } from "../middlewares";

const userMusicianRouter = express.Router();

// Only Musician Dashboard [뮤지션 대시보드 하위 페이지만 작성]

// My Studio
userMusicianRouter.get(routes.myStudio, onlyMusician, getMyStudio);

// My Request
userMusicianRouter.get(routes.myRequest, onlyMusician, paginate.middleware(20, 50), getMyRequest);

// Expert Detail
userMusicianRouter.get(`${routes.expertDetail}/:expertID`, onlyUser, getExpertDetail);

// Chat [공통 pug 사용]
userMusicianRouter.get(routes.chat, onlyMusician, getChat);

// Payment
userMusicianRouter.get(routes.payment, onlyMusician, paginate.middleware(5, 50), getPayment);

// Profile [공통 pug 사용]
userMusicianRouter.get(routes.profile, onlyMusician, getProfile);
userMusicianRouter.post(routes.profile, onlyMusician, postUpdateProfile);

// Change Password [공통 pug 사용]
userMusicianRouter.get(routes.changePW, onlyMusician, getChangePW);
userMusicianRouter.post(routes.changePW, onlyMusician, postChangePW);

// Reception
userMusicianRouter.get(`${routes.reception}/:requestedID`, onlyMusician, getReception);

// Expert Review
userMusicianRouter.get(`${routes.expertReview}/:expertID`, onlyMusician, getExpertReview);
userMusicianRouter.post(`${routes.expertReview}/:expertID`, onlyMusician, postExpertReview);

export default userMusicianRouter;
