// Global
const HOME = "/";
const NEWS_ROOM = "/news-room";
const CONFERENCE_ROOM = "/conference-room";
const PRIVACY_POLICY = "/privacy-policy";
const TERMS_OF_USE = "/terms-of-use";
const LEGAL_NOTICE = "/legal-notice";
const MUSICIAN_LIST = "/musician-list";
const MAINVIDEO_DETAIL = "/mainVideo-detail";
const MOSTVIDEO_DETAIL = "/mostVideo-detail";
const OFFERDVIDEO_DETAIL = "/offerdVideo-detail";

// User
const USER = "/user";
const REGISTER = "/register";
const SIGN_IN = "/sign-in";
const SIGN_OUT = "/sign-out";
const LEAVE_MEMBERSHIP = "/leave-membership";
const FINDID = "/find-id";
const FINDPW = "/find-pw";
const FIND_CHANGE_PW = "/find-chage-pw";

// User - Musician
const GET_HIGHER = "/get-higher";
const SUBSCRIBE_PURCHASE = "/subscribe-purchase";
const SERVICE_DIAGNOSIS = "/service-diagnosis";
const SERVICE_REQUEST = "/service-request";
// User - Expert
// User - Musician & Expert 공통
const MY_FAVORITE = "/my-favorite";
const CHAT = "/chat";

// **** Dashboard 페이지만 작성 ****
// User Musician & Expert Dashboard 공통
const MY_STUDIO = "/my-studio";
const PROFILE = "/profile";
const CHANGE_PW = "/change-pw";
// User Musician Dashboard
const USER_MUSICIAN = "/user-musician";
const MY_REQUEST = "/my-request";
const EXPERT_DETAIL = "/expert-detail";
const EXPERT_REVIEW = "/expert-review";
const PAYMENT = "/payment";
const RECEPTION = "/reception";
// User Expert Dashboard
const USER_EXPERT = "/user-expert";
const MANAGE_REQUEST = "/manage-request";
const WITHDRAWAL = "/withdrawal";
const UPLOAD = "/upload";

// Admin
const ADMIN = "/admin";
const ADMIN_REGISTER = "/register";
const ADMIN_LOGIN = "/login";
const ADMIN_LOGOUT = "/logout";
const ADMIN_CHANGE_PW = "/change-pw";
const ADMIN_USER = "/user";
const ADMIN_MUSICIAN = "/musician";
const ADMIN_MEMBERSHIP = "/membership";
const ADMIN_EXPERT = "/expert";
const ADMIN_BLOCKED_ACCOUNT = "/blocked-account";
const ADMIN_MAIN_VIDEO = "/main-video";
const ADMIN_MOST_VIDEO = "/most-video";
const ADMIN_PARTNER_LOGO = "/partner-logo";
const ADMIN_CONFERENCE_ROOM = "/conference-room";
const ADMIN_NEWS_CATEGORY = "/news-category";
const ADMIN_NEWS_CONTENTS = "/news-contents";
const ADMIN_MISSION = "/mission";
const ADMIN_CACULATE = "/calculate";
// ADMIN SAMPLE(CRUD용)
const ADMIN_SAMPLE = "/sample";

// API
const API = "/api";

const routes = {
  // Global
  home: HOME,
  newsRoom: NEWS_ROOM,
  conferenceRoom: CONFERENCE_ROOM,
  privacyPolicy: PRIVACY_POLICY,
  termsOfUse: TERMS_OF_USE,
  legalNotice: LEGAL_NOTICE,
  musicianList: MUSICIAN_LIST,
  mainVideoDetail: MAINVIDEO_DETAIL,
  mostVideoDetail: MOSTVIDEO_DETAIL,
  offerdVideoDetail: OFFERDVIDEO_DETAIL,

  // User
  user: USER,
  register: REGISTER,
  signIn: SIGN_IN,
  signOut: SIGN_OUT,
  leaveMembership: LEAVE_MEMBERSHIP,
  findID: FINDID,
  findPW: FINDPW,
  findChangePW: FIND_CHANGE_PW,

  // User - Musician
  getHigher: GET_HIGHER,
  subscribePurchase: SUBSCRIBE_PURCHASE,
  serviceDiagnosis: SERVICE_DIAGNOSIS,
  serviceRequest: SERVICE_REQUEST,
  // User - Expert
  // User - Musician & Expert 공통
  myFavorite: MY_FAVORITE,
  chat: CHAT,

  // **** Dashboard 페이지만 작성 ****
  // User Musician & Expert Dashboard 공통
  myStudio: MY_STUDIO,
  profile: PROFILE,
  changePW: CHANGE_PW,
  // User Musician Dashboard
  userMusician: USER_MUSICIAN,
  myRequest: MY_REQUEST,
  expertDetail: EXPERT_DETAIL,
  expertReview: EXPERT_REVIEW,
  payment: PAYMENT,
  reception: RECEPTION,
  // User Expert Dashboard
  userExpert: USER_EXPERT,
  manageRequest: MANAGE_REQUEST,
  withdrawal: WITHDRAWAL,
  upload: UPLOAD,

  // Admin
  admin: ADMIN,
  adminRegister: ADMIN_REGISTER,
  adminLogin: ADMIN_LOGIN,
  adminLogout: ADMIN_LOGOUT,
  adminChangePW: ADMIN_CHANGE_PW,
  adminUser: ADMIN_USER,
  adminMusician: ADMIN_MUSICIAN,
  adminMembership: ADMIN_MEMBERSHIP,
  adminExpert: ADMIN_EXPERT,
  adminBlockedAccount: ADMIN_BLOCKED_ACCOUNT,
  adminMainVideo: ADMIN_MAIN_VIDEO,
  adminMostVideo: ADMIN_MOST_VIDEO,
  adminPartnerLogo: ADMIN_PARTNER_LOGO,
  adminConferenceRoom: ADMIN_CONFERENCE_ROOM,
  adminNewsCategory: ADMIN_NEWS_CATEGORY,
  adminNewsContents: ADMIN_NEWS_CONTENTS,
  adminMission: ADMIN_MISSION,
  adminCalculate: ADMIN_CACULATE,
  // ADMIN SAMPLE(CRUD용)
  adminSample: ADMIN_SAMPLE,

  // API
  api: API,
};

export default routes;
