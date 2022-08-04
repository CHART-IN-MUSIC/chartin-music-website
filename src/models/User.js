import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema({
  // *** Common [공통] ***
  userID: String, // 이메일 주소
  role: String, // 회원 타입 [관리자=master, 일반관리자=admin, 뮤지션 승인 대기중=musicianAwait, 전문가 승인 대기중=expertAwait , 뮤지션=musician, 전문가=expert]
  emailSubscription: { type: Boolean, default: true }, // 이메일 구독 여부
  gradientColor: String, // 프로필 이미지 [필수값]
  facebook: String, // 소셜미디어 페이스북 [선택값]
  instagram: String, // 소셜미디어 인스타그램 [선택값]
  tiktok: String, // 소셜미디어 틱톡 [선택값]
  youtube: String, // 소셜미디어 유튜브 [선택값]
  spotify: String, // 소셜미디어 스포티파이 [선택값]
  website: String, // 소셜미디어 웹사이트 [선택값]
  name: String, // 이름 [필수값]
  overview: String, // 간략 소개 [필수값]
  currentCountry: String, // 현재 국가 [필수값]
  joinReason: String, // 가입 이유 [필수값]
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  firstSignIn: { type: Boolean, default: true },
  // 내가 받은 좋아요 총 개수 표시
  likeID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Like",
    },
  ],

  createdAt: { type: Date, default: new Date() }, // 가입일
  updatedAt: Date, // 수정일

  // *** Musician [뮤지션] ***
  genre: String, // 장르 [필수값]
  targetCountry: Array, // 타겟 국가 [필수값]
  youtubeMusicVideo: String, // 유튜브 뮤직 비디오 링크 [선택값]
  subscription: { type: Boolean, default: false }, // 정기 결제 구독 여부
  missions: [
    {
      status: String, // doing, complete [상태 : 진행중, 완료]
      start: Date, // 해당 미션 Start 날짜
      missionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mission",
      },
    },
  ],

  // *** Expert [전문가] ***
  title: String, // 타이틀 [필수값]
  previousClients: String, // Previous/Current Clients [필수값]
  bestProject: String, // Best Project/Portfolio (Link) [필수값]
  providableServices: Array, // Providable Services [필수값]
  serviceCountry: Array, // 서비스 국가 [필수값]
  company: String, // 회사명 [필수값]
  experience: String, // 경험 정도 [필수값]
  scooter: String, // Brown : 기본 , Black : 별점 1.5 미만 , Silver : 좋아요 15개 이상, 서비스 제공 5개 이상, 별점 4 이상 , Gold : 좋아요 30개 이상, 서비스 제공 20개 이상, 별점 4.5 이상 (*필수 조건: 회원 가입시 작성하는 "business registration" 작성칸에 내용이 있어야만 Gold 뱃지 획득 가능)
  averageRate: Number, // 전문가가 받은 총 평점 소수점 1자리까지 ex 5.0 of 4.5
  // 승인완료된 offers
  approvedOffers: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Offer",
    },
  ],
});

UserSchema.plugin(passportLocalMongoose, { usernameField: "userID" });

const model = mongoose.model("User", UserSchema);

export default model;
