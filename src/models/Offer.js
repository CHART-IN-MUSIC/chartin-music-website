import mongoose from "mongoose";

const { Schema } = mongoose;

const OfferSchema = new Schema({
  // feedback promotion mixmaster 3가지 모두 공통
  chooseBool: { type: Boolean, default: false }, // 선택된 오퍼이면 choose버튼 안보이게 하기 위함
  musicianName: String, // 뮤지션 이름

  // feedbak 공통
  finishOffer: { type: Boolean, default: false }, // (중복결제 방지)3개의 피드백을 모두 받고 1개 선택 후 See Feedback 이동 시 제공받은 offer 3개는 유지되고 choose 버튼 사라지게하기위함
  overview: String, // 간단설명
  impression: String, // 영감 받은 내용
  references: String, // 참고할 내용
  advice: String, // 충구할 내용
  monetize: String, //
  evaluation: String, // 진화시킬 내용
  collaborate: String, // 협업내용
  bestFits: Array, // 좋은점들
  expect1: String,
  expect2: String,
  // 전문가
  expertID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],

  // 테크니컬
  enhance: String, //
  structure: String, //
  improved: String, //

  // 트렌드
  content: String,
  fan: String,
  strengh: String,
  emotionally: String,

  //  프로모션 믹스마스터 공통
  campaignTitle: String, // 프로모션 캠페인 제목
  startDate: Date,

  // promotion
  promotionResultType: Array, //프로모션 결과물 타입
  channels: Array, //채널들
  campaignPeriod: String, // 캠페인 기간
  contentLink: String, // 유튜브나 틱톡링크만
  reportLink: String, //

  // mixmaster
  mixmasterResultType: String,
  finalSongLink: String,
  message: String,

  createdAt: { type: Date, default: new Date() },
});

const model = mongoose.model("Offer", OfferSchema);

export default model;
