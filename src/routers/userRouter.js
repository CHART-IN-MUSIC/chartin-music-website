import express from "express";
import routes from "../routes";
import {
  getSignIn,
  postSignIn,
  getSignInUnsubscribe,
  postSignInUnsubscribe,
  getSignOut,
  getRegister,
  getMusicianRegister,
  postMusicianRegister,
  getMusicianRegisterDescription,
  getMusicianRegisterWelcome,
  getExpertRegister,
  postExpertRegister,
  getExpertRegisterDescription,
  getExpertRegisterWelcome,
  getGetHigher,
  getSubscribePurchase,
  getServiceDiagnosis,
  postServiceDiagnosis,
  getServiceDiagnosisResult,
  getServiceRequest,
  getDirectServiceRequest,
  getMyFavorite,
  getCheckChat,
  getChatDetail,
  getLeaveMembership,
  getFindID,
  getFindPW,
  postFindPW,
  getFindChangePW,
  postFindChangePW,
} from "../controllers/userController";
import { onlyPublic, onlyUser, onlyMusician, onlyExpert, checkUserLogged } from "../middlewares";

const userRouter = express.Router();

// 로그인
userRouter.get(routes.signIn, onlyPublic, getSignIn);
userRouter.post(routes.signIn, onlyPublic, postSignIn);

// 이메일 구독 취소
userRouter.get(`${routes.signIn}/unsubscribe`, checkUserLogged, getSignInUnsubscribe);
userRouter.post(`${routes.signIn}/unsubscribe`, onlyPublic, postSignInUnsubscribe);

// 로그아웃
userRouter.get(routes.signOut, onlyUser, getSignOut);

// 회원가입
userRouter.get(routes.register, onlyPublic, getRegister);
// 뮤지션 회원가입
userRouter.get(`${routes.register}/musician`, onlyPublic, getMusicianRegister);
userRouter.post(`${routes.register}/musician`, onlyPublic, postMusicianRegister);
userRouter.get(`${routes.register}/musician/description`, onlyPublic, getMusicianRegisterDescription);
userRouter.get(`${routes.register}/musician/welcome`, onlyUser, getMusicianRegisterWelcome);
// 전문가 회원가입
userRouter.get(`${routes.register}/expert`, onlyPublic, getExpertRegister);
userRouter.post(`${routes.register}/expert`, onlyPublic, postExpertRegister);
userRouter.get(`${routes.register}/expert/description`, onlyPublic, getExpertRegisterDescription);
userRouter.get(`${routes.register}/expert/welcome`, onlyUser, getExpertRegisterWelcome);

// **** 뮤지션 전용 페이지 ****
// 뮤지션 - Get Higher
userRouter.get(routes.getHigher, onlyMusician, getGetHigher);
// 뮤지션 - 구독 결제 페이지
userRouter.get(routes.subscribePurchase, onlyMusician, getSubscribePurchase);
// 뮤지션 - Service Diagnosis
userRouter.get(routes.serviceDiagnosis, onlyMusician, getServiceDiagnosis);
userRouter.post(routes.serviceDiagnosis, onlyMusician, postServiceDiagnosis);
userRouter.get(`${routes.serviceDiagnosis}/result/:diagnosisID`, onlyMusician, getServiceDiagnosisResult);
// 뮤지션 - Service Request
userRouter.get(routes.serviceRequest, onlyMusician, getServiceRequest);
// 뮤지션 - Direct Service Request
userRouter.get(`${routes.serviceRequest}/:expertID`, onlyMusician, getDirectServiceRequest);

// **** 뮤지션 / 전문가 공통 페이지 ****
// My Favorite [공통 pug 사용]
userRouter.get(routes.myFavorite, onlyUser, getMyFavorite);
// Chat 대화 중인 채팅이 있는지 확인
userRouter.get(`${routes.chat}/check/:musicianID/:expertID`, onlyUser, getCheckChat);
// Chat 대화 상세 페이지
userRouter.get(`${routes.chat}/detail/:chatID`, onlyUser, getChatDetail);
// 회원탈퇴
userRouter.get(`${routes.leaveMembership}/:userID`, onlyUser, getLeaveMembership);

// 아이디 비밀번호 찾기
userRouter.get(`${routes.findID}`, onlyPublic, getFindID);
userRouter.get(`${routes.findPW}`, onlyPublic, getFindPW);
userRouter.post(`${routes.findPW}`, onlyPublic, postFindPW);

// 비밀번호 변경
userRouter.get(`${routes.findChangePW}/:userID`, onlyPublic, getFindChangePW);
userRouter.post(`${routes.findChangePW}/:userID`, onlyPublic, postFindChangePW);

export default userRouter;
