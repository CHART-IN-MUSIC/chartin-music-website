import mongoose from "mongoose";

const { Schema } = mongoose;

const FeedbackSchema = new Schema({
  status: String, // IN PROGRESS, RESULT, DONE, REQUESTED
  title: { type: String, default: "feedback" },
  type: String, // trend, technical [feedback 타입]
  concept: String,
  link: String,
  markets: Array,
  country: String,
  genre: String,
  budget: String,
  ownVideo: String,
  goal: Array,
  expertNames: Array, // 오퍼제공한 전문가 이름들
  // 요청한 뮤지션
  musicianID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],
  // 피드백 모델
  offerID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Offer",
    },
  ],
  // 결제정보
  purchaseID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Purchase",
    },
  ],
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date, // 수정일
});

const model = mongoose.model("Feedback", FeedbackSchema);

export default model;
