import paginate from "express-paginate";
import express from "express";
import routes from "../routes";
import {
  getAdminLogin,
  postAdminLogin,
  getAdminRegister,
  postAdminRegister,
  adminLogout,
  getAdminChangePW,
  postAdminChangePW,
  adminUser,
  adminUserApprove,
  adminUserDelete,
  adminMusician,
  adminMusicianApprove,
  getAdminMusicianDetail,
  adminMembership,
  adminExpert,
  adminExpertApprove,
  getAdminExpertDetail,
  adminBlockedAccount,
  adminMainVideo,
  getCreateMainVideo,
  postCreateMainVideo,
  getMainVideoDetail,
  getUpdateMainVideo,
  postUpdateMainVideo,
  adminMostVideo,
  getCreateMostVideo,
  postCreateMostVideo,
  getMostVideoDetail,
  getUpdateMostVideo,
  postUpdateMostVideo,
  getDeleteMostVideo,
  adminPartnerLogo,
  getCreatePartnerLogo,
  postCreatePartnerLogo,
  getPartnerLogoDetail,
  getUpdatePartnerLogo,
  postUpdatePartnerLogo,
  getDeletePartnerLogo,
  adminConferenceRoom,
  getConferenceRoomDetail,
  getDeleteConferenceRoom,
  adminNewsCategory,
  getCreateNewsCategory,
  postCreateNewsCategory,
  getUpdateNewsCategory,
  postUpdateNewsCategory,
  getDeleteNewsCategory,
  adminNewsContents,
  getCreateNewsContents,
  postCreateNewsContents,
  getNewsContentsDetail,
  getUpdateNewsContents,
  postUpdateNewsContents,
  getDeleteNewsContents,
  adminMission,
  getCreateMission,
  postCreateMission,
  getUpdateMission,
  postUpdateMission,
  getDeleteMission,
  adminCalculate,
  postAdminCalculate,
  adminSample,
  getCreateSample,
  postCreateSample,
  getSampleDetail,
  getUpdateSample,
  postUpdateSample,
  getDeleteSample,
} from "../controllers/adminController";
import { onlyAdmin, uploadMissionPic, uploadSamplePic } from "../middlewares";

const adminRouter = express.Router();

// 관리자 로그인
adminRouter.get("/", getAdminLogin);
adminRouter.post(routes.adminLogin, postAdminLogin);

// 관리자 회원가입
adminRouter.get(routes.adminRegister, getAdminRegister);
adminRouter.post(routes.adminRegister, postAdminRegister);

// 로그아웃
adminRouter.get(routes.adminLogout, onlyAdmin, adminLogout);

// 비밀번호 변경
adminRouter.get(`${routes.adminChangePW}`, onlyAdmin, getAdminChangePW);
adminRouter.post(`${routes.adminChangePW}`, onlyAdmin, postAdminChangePW);

// 관리자 계정 관리
adminRouter.get(routes.adminUser, onlyAdmin, paginate.middleware(20, 50), adminUser);
adminRouter.get(`${routes.adminUser}/approve/:userID`, onlyAdmin, adminUserApprove);
adminRouter.get(`${routes.adminUser}/delete/:userID`, onlyAdmin, adminUserDelete);

// 뮤지션 계정 관리
adminRouter.get(routes.adminMusician, onlyAdmin, paginate.middleware(20, 50), adminMusician);
adminRouter.post(`${routes.adminMusician}/approve`, onlyAdmin, adminMusicianApprove);
adminRouter.get(`${routes.adminMusician}/detail/:musicianID`, onlyAdmin, getAdminMusicianDetail);

// 멤버십 계정 관리
adminRouter.get(routes.adminMembership, onlyAdmin, paginate.middleware(20, 50), adminMembership);
// adminRouter.get(`${routes.adminSample}/detail/:sampleID`, onlyAdmin, getSampleDetail);

// 전문가 계정관리
adminRouter.get(routes.adminExpert, onlyAdmin, paginate.middleware(20, 50), adminExpert);
adminRouter.post(`${routes.adminExpert}/approve`, onlyAdmin, adminExpertApprove);
adminRouter.get(`${routes.adminExpert}/detail/:expertID`, onlyAdmin, getAdminExpertDetail);

// 차단 계정 관리
adminRouter.get(routes.adminBlockedAccount, onlyAdmin, paginate.middleware(20, 50), adminBlockedAccount);

// HYPE - 메인 영상 관리
adminRouter.get(routes.adminMainVideo, onlyAdmin, paginate.middleware(20, 50), adminMainVideo);
adminRouter.get(`${routes.adminMainVideo}/create`, onlyAdmin, getCreateMainVideo);
adminRouter.post(`${routes.adminMainVideo}/create`, onlyAdmin, postCreateMainVideo);
adminRouter.get(`${routes.adminMainVideo}/detail/:mainVideoID`, onlyAdmin, getMainVideoDetail);
adminRouter.get(`${routes.adminMainVideo}/update/:mainVideoID`, onlyAdmin, getUpdateMainVideo);
adminRouter.post(`${routes.adminMainVideo}/update/:mainVideoID`, onlyAdmin, postUpdateMainVideo);

// HYPE - M/W 영상 관리
adminRouter.get(routes.adminMostVideo, onlyAdmin, paginate.middleware(20, 50), adminMostVideo);
adminRouter.get(`${routes.adminMostVideo}/create`, onlyAdmin, getCreateMostVideo);
adminRouter.post(`${routes.adminMostVideo}/create`, onlyAdmin, postCreateMostVideo);
adminRouter.get(`${routes.adminMostVideo}/detail/:mostVideoID`, onlyAdmin, getMostVideoDetail);
adminRouter.get(`${routes.adminMostVideo}/update/:mostVideoID`, onlyAdmin, getUpdateMostVideo);
adminRouter.post(`${routes.adminMostVideo}/update/:mostVideoID`, onlyAdmin, postUpdateMostVideo);
adminRouter.get(`${routes.adminMostVideo}/delete/:mostVideoID`, onlyAdmin, getDeleteMostVideo);

// HYPE - 파트너 로고 관리
adminRouter.get(routes.adminPartnerLogo, onlyAdmin, paginate.middleware(20, 50), adminPartnerLogo);
adminRouter.get(`${routes.adminPartnerLogo}/create`, onlyAdmin, getCreatePartnerLogo);
adminRouter.post(`${routes.adminPartnerLogo}/create`, onlyAdmin, postCreatePartnerLogo);
adminRouter.get(`${routes.adminPartnerLogo}/detail/:partnerLogoID`, onlyAdmin, getPartnerLogoDetail);
adminRouter.get(`${routes.adminPartnerLogo}/update/:partnerLogoID`, onlyAdmin, getUpdatePartnerLogo);
adminRouter.post(`${routes.adminPartnerLogo}/update/:partnerLogoID`, onlyAdmin, postUpdatePartnerLogo);
adminRouter.get(`${routes.adminPartnerLogo}/delete/:partnerLogoID`, onlyAdmin, getDeletePartnerLogo);

adminRouter.get(routes.adminConferenceRoom, onlyAdmin, paginate.middleware(20, 50), adminConferenceRoom);
adminRouter.get(`${routes.adminConferenceRoom}/detail/:conferenceID`, onlyAdmin, getConferenceRoomDetail);
adminRouter.get(`${routes.adminConferenceRoom}/delete/:conferenceID`, onlyAdmin, getDeleteConferenceRoom);

// NEWS ROOM - 뉴스 카테고리 관리
adminRouter.get(routes.adminNewsCategory, onlyAdmin, paginate.middleware(20, 50), adminNewsCategory);
adminRouter.get(`${routes.adminNewsCategory}/create`, onlyAdmin, getCreateNewsCategory);
adminRouter.post(`${routes.adminNewsCategory}/create`, onlyAdmin, postCreateNewsCategory);
adminRouter.get(`${routes.adminNewsCategory}/update/:newsCategoryID`, onlyAdmin, getUpdateNewsCategory);
adminRouter.post(`${routes.adminNewsCategory}/update/:newsCategoryID`, onlyAdmin, postUpdateNewsCategory);
adminRouter.get(`${routes.adminNewsCategory}/delete/:newsCategoryID`, onlyAdmin, getDeleteNewsCategory);

// NEWS ROOM - 뉴스 컨텐츠 관리
adminRouter.get(routes.adminNewsContents, onlyAdmin, paginate.middleware(20, 50), adminNewsContents);
adminRouter.get(`${routes.adminNewsContents}/create`, onlyAdmin, getCreateNewsContents);
adminRouter.post(`${routes.adminNewsContents}/create`, onlyAdmin, postCreateNewsContents);
adminRouter.get(`${routes.adminNewsContents}/detail/:newsID`, onlyAdmin, getNewsContentsDetail);
adminRouter.get(`${routes.adminNewsContents}/update/:newsID`, onlyAdmin, getUpdateNewsContents);
adminRouter.post(`${routes.adminNewsContents}/update/:newsID`, onlyAdmin, postUpdateNewsContents);
adminRouter.get(`${routes.adminNewsContents}/delete/:newsID`, onlyAdmin, getDeleteNewsContents);

// GET HIGHER - 미션 관리
adminRouter.get(routes.adminMission, onlyAdmin, paginate.middleware(20, 50), adminMission);
adminRouter.get(`${routes.adminMission}/create`, onlyAdmin, getCreateMission);
adminRouter.post(`${routes.adminMission}/create`, onlyAdmin, uploadMissionPic, postCreateMission);
adminRouter.get(`${routes.adminMission}/update/:missionID`, onlyAdmin, getUpdateMission);
adminRouter.post(`${routes.adminMission}/update/:missionID`, onlyAdmin, uploadMissionPic, postUpdateMission);
adminRouter.get(`${routes.adminMission}/delete/:missionID`, onlyAdmin, getDeleteMission);

// 관리자 월별 정산 관리
adminRouter.get(routes.adminCalculate, onlyAdmin, paginate.middleware(20, 50), adminCalculate);
adminRouter.post(routes.adminCalculate, onlyAdmin, postAdminCalculate);

// 관리자 샘플 관리
adminRouter.get(routes.adminSample, onlyAdmin, paginate.middleware(20, 50), adminSample);
adminRouter.get(`${routes.adminSample}/create`, onlyAdmin, getCreateSample);
adminRouter.post(`${routes.adminSample}/create`, onlyAdmin, uploadSamplePic, postCreateSample);
adminRouter.get(`${routes.adminSample}/detail/:sampleID`, onlyAdmin, getSampleDetail);
adminRouter.get(`${routes.adminSample}/update/:sampleID`, onlyAdmin, getUpdateSample);
adminRouter.post(`${routes.adminSample}/update/:sampleID`, onlyAdmin, uploadSamplePic, postUpdateSample);
adminRouter.get(`${routes.adminSample}/delete/:sampleID`, onlyAdmin, getDeleteSample);

export default adminRouter;
