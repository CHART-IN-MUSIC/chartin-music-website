import mongoose from "mongoose";

const { Schema } = mongoose;

const PromotionSchema = new Schema({
  serviceType: { type: Boolean, default: false }, // 기본 false , 직접요청시 true
  status: String, // PROPOSAL, IN PROGRESS, RESULT, DONE, REQUESTED
  title: { type: String, default: "promotion" },
  name: String, //이름
  genre: String, //장르
  link: String, // 영상 링크
  link2: String, // 영상 2번째 링크
  markets: Array, // 타겟으로하는 지역
  country: String, // 선호지역
  video: Boolean, // 비디오 만들수 있는지 없는지
  budget: String, // 예산
  detail: String, // 추가 설명
  expertName: String, // 선택된 전문가 이름
  // 직접요청받은 전문가
  expertID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],
  // 요청한 뮤지션
  musicianID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],

  // 제안 모델
  proposalID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Proposal",
    },
  ],
  // 업로드 결과물
  offerID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Offer",
    },
  ],
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date, // 수정일
});

const model = mongoose.model("Promotion", PromotionSchema);

export default model;
