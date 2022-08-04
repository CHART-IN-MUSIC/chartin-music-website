import mongoose from "mongoose";

const { Schema } = mongoose;

const MixMasterSchema = new Schema({
  serviceType: { type: Boolean, default: false }, // 기본 false , 직접요청시 true
  status: String, // PROPOSAL, IN PROGRESS, RESULT, DONE, REQUESTED
  title: { type: String, default: "mixmaster" },
  name: String, //이름
  genre: String, //장르
  link: String, // 영상 링크
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

const model = mongoose.model("MixMaster", MixMasterSchema);

export default model;
