import express from "express";
import {
  createLangCookie,
  deleteLangCookie,
  createNewsImg,
  emailDupleChk,
  sendAuthEmail,
  changeConferenceLike,
  createPartnerLogoImg,
  createVideoThumbnailImg,
  postFeedbackPurchaseSaveType,
  postPurchasePingback,
  getPurchaseSuccess,
  createRequestedPromotion,
  createRequestedMixMaster,
  changeUserLike,
  postMissionStart,
  postMissionComplete,
  postMissionRestart,
  postFeedbackChoose,
  postChoosePurchaseForm,
  chageRequestedStatus,
  postLeaveChat,
  postSaveChat,
  postChatAlarm,
  postMyStudioGoal,
  postMyStudioPurchaseForm,
  WithdrawalAmountChk,
  changeSaveStatus,
  postSetPrivacyCookie,
  postAlarmRead,
  // checkInProgressService,
  uploadConferenceFile,
  checkName,
  checkNameUpdate,
  createRecomment,
  postFindID,
  sendAuthPassword,
  createFeedbackBeforePurchase,
  postBlockUser,
  postUnblockUser,
} from "../controllers/apiController";
import {
  onlyAdmin,
  onlyPublic,
  onlyUser,
  onlyMusician,
  onlyExpert,
  uploadSummernotePics,
  uploadNewsImgPic,
  uploadPartnerLogoPic,
  uploadVideoThumbnailPic,
  uploadConferenceFilePic,
} from "../middlewares";

const apiRouter = express.Router();

// 푸터 한국 국기 클릭 시 쿠키 등록
apiRouter.get("/create-lang-cookie", createLangCookie);
// 푸터 미국 국기 클릭 시 쿠키 삭제 [기본값: 영어]
apiRouter.get("/delete-lang-cookie", deleteLangCookie);

// 뉴스 콘텐츠 summernote 이미지 등록
apiRouter.post("/newsContents-img/ajax_summernote", uploadSummernotePics, (req, res) => {
  res.send(req.file.location);
});
// 뉴스 콘텐츠 이미지 등록
apiRouter.post("/create-newsImg", uploadNewsImgPic, createNewsImg);

// 회원가입 시 이메일 중복 체크
apiRouter.post("/email-duple-chk", onlyPublic, emailDupleChk);
// 회원가입 시 이메일 인증번호 전송
apiRouter.post("/send-auth-email", onlyPublic, sendAuthEmail);

// Create Conference Like
apiRouter.post("/change-conferenceLike", changeConferenceLike);

// 파트너 로고 이미지 등록
apiRouter.post("/create-partnerLogoImg", onlyAdmin, uploadPartnerLogoPic, createPartnerLogoImg);

// 영상 썸네일 이미지 등록
apiRouter.post("/create-thumbnailImg", onlyAdmin, uploadVideoThumbnailPic, createVideoThumbnailImg);

// Feedback Trend 또는 Technical 타입 선택 시 Purchase에 데이터 저장
apiRouter.post("/feedback-purchase/save-type", onlyMusician, postFeedbackPurchaseSaveType);
// 결제 Pingback
apiRouter.post("/purchase/pingback", postPurchasePingback);
// 결제 Success
apiRouter.get("/purchase/success", getPurchaseSuccess);

// Promotion 생성
apiRouter.post("/create-requested-promotion", onlyMusician, createRequestedPromotion);

// MixMaster 생성
apiRouter.post("/create-requested-mixMaster", onlyMusician, createRequestedMixMaster);

// User Like
apiRouter.post("/change-userLike", onlyUser, changeUserLike);

// Get Higher - Mission Start
apiRouter.post("/mission-start", onlyMusician, postMissionStart);
// Get Higher - Mission Complete
apiRouter.post("/mission-complete", onlyMusician, postMissionComplete);
// Get Higher - Mission Restart
apiRouter.post("/mission-restart", onlyMusician, postMissionRestart);

// Reception Feedback Choose 버튼 클릭 시
apiRouter.post("/choose-feedback", onlyMusician, postFeedbackChoose);

// Reception Choose 모달 팝업 Purchase 버튼 클릭 시 purchaseForm 생성
apiRouter.post("/choose-purchase-form", onlyMusician, postChoosePurchaseForm);

// Approve btn click => change requested status
apiRouter.post("/change-requested-status", onlyMusician, chageRequestedStatus);

// 채팅방 나가기 버튼 클릭 시 삭제
apiRouter.post("/leave-chat", onlyUser, postLeaveChat);
// 서버에 채팅 대화 내용 저장
apiRouter.post("/save-chat", onlyUser, postSaveChat);
// 채팅 진행 시 상대방에게 알림 및 이메일 전송
apiRouter.post("/send-alarm", onlyUser, postChatAlarm);

// 뮤지션 My Studio Goal 생성/수정
apiRouter.post("/myStudio-goal", onlyMusician, postMyStudioGoal);

// 뮤지션 My Studio Customized Payment에서 Purchase 버튼 클릭 시 purchaseForm 생성
apiRouter.post("/myStudio-purchase-form", onlyMusician, postMyStudioPurchaseForm);

// 인출요청금액 점검
apiRouter.post("/check-withdrawal-amount", onlyExpert, WithdrawalAmountChk);

// 정산완료시 save status await => complete
apiRouter.post("/change-save-status", onlyExpert, changeSaveStatus);

// 하단 쿠키 정책 팝업 Accept 버튼 클릭 시 쿠키 저장
apiRouter.post("/set-privacy-cookie", postSetPrivacyCookie);

// 알림 아이콘 클릭 시 읽음 처리
apiRouter.post("/alarm-read", postAlarmRead);

// 직접요청 버튼 클릭시 헤당전문가와 현재진행중인 피드백, 프로모션, 믹스마스터 있는지 점검 (있으면 요청 불가)
// apiRouter.post("/check-in-progress-service", checkInProgressService);

// 컨퍼런스 사진 첨부
apiRouter.post("/upload-conferenceFile", uploadConferenceFilePic, uploadConferenceFile);

// 회원가입 이름중복체크
apiRouter.post("/check-name", checkName);

// 프로필업데이트 이름중복체크
apiRouter.post("/check-name-update", checkNameUpdate);

// 대댓글 생성
apiRouter.post("/create-recomment", createRecomment);

// 아이디 찾기
apiRouter.post("/find-id", postFindID);

// 비밀번호 찾기 시 이메일 인증번호 전송
apiRouter.post("/send-auth-password", onlyPublic, sendAuthPassword);

// 피드백 작성 후 생성
apiRouter.post("/create-feedback-before-purchase", createFeedbackBeforePurchase);

// 계정 Block 처리
apiRouter.post("/block-user", postBlockUser);
// 계정 Unblock 처리
apiRouter.post("/unblock-user", postUnblockUser);

export default apiRouter;
