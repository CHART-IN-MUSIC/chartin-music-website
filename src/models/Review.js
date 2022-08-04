import mongoose from "mongoose";

const { Schema } = mongoose;

const ReviewSchema = new Schema({
  desc: String, // 리뷰 내용
  rate: Number, // 별점  1점단위 최대 5점
  // 리뷰와 평점 남긴 뮤지션
  musicianID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // 리뷰와 평점을 받은 전문가
  expertID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,
});

const model = mongoose.model("Review", ReviewSchema);

export default model;
