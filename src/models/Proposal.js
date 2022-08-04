import mongoose from "mongoose";

const { Schema } = mongoose;

const ProposalSchema = new Schema({
  chooseBool: { type: Boolean, default: false }, // 선택된 제안 다시 choose 못하게 하기 위함(true일때)
  // 공통
  overview: String, // 간단한 설명
  budget: Number, // 총 예산
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,
  type: String, // promotion, mixmaster
  // 전문가
  expertID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],
  // promotion
  planText: String, // plan text
  planLink: String, // plan link
  planFile: String, // 제공할 프로모션 계획 파일
  duration: String, // 기간 (다중선택)
  markets: String, // 운영중인 서비스
  specialize: Array, // 특별한 프로모션
  engage: String, // 고객을 사로잡기위한 내용

  //mixmaster
  change: String, // 음악 어떻게 mixmaster할지 내용
  pastWork: String, // 과거 했던일
  date: Number, // 정확한 날짜
  googleDrive: String, // 구글드라이브링크
});

const model = mongoose.model("Proposal", ProposalSchema);

export default model;
