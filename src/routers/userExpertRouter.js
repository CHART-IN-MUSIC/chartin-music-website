import paginate from "express-paginate";
import express from "express";
import routes from "../routes";
import { getMyStudio, getManageRequest, getChat, getWithdrawal, postWithdrawal, getProfile, postUpdateProfile, getChangePW, postChangePW, getUpload, postUpload } from "../controllers/userExpertController";
import { onlyExpert } from "../middlewares";

const userExpertRouter = express.Router();

// Only Expert Dashboard [전문가 대시보드 하위 페이지만 작성]

// My Studio
userExpertRouter.get(routes.myStudio, onlyExpert, getMyStudio);

// Manage Request
userExpertRouter.get(routes.manageRequest, onlyExpert, paginate.middleware(20, 50), getManageRequest);

// Chat [공통 pug 사용]
userExpertRouter.get(routes.chat, onlyExpert, getChat);

// Withdrawal
userExpertRouter.get(routes.withdrawal, onlyExpert, paginate.middleware(20, 50), getWithdrawal);
userExpertRouter.post(routes.withdrawal, onlyExpert, postWithdrawal);

// Profile [공통 pug 사용]
userExpertRouter.get(routes.profile, onlyExpert, getProfile);
userExpertRouter.post(routes.profile, onlyExpert, postUpdateProfile);

// Change Password [공통 pug 사용]
userExpertRouter.get(routes.changePW, onlyExpert, getChangePW);
userExpertRouter.post(routes.changePW, onlyExpert, postChangePW);

// Upload page
userExpertRouter.get(`${routes.upload}/:requestedID`, onlyExpert, getUpload);
userExpertRouter.post(`${routes.upload}/:requestedID`, onlyExpert, postUpload);

export default userExpertRouter;
