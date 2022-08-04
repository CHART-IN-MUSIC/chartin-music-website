import mongoose from "mongoose";

const { Schema } = mongoose;

const GoalSchema = new Schema({
  // 등록한 뮤지션
  musicianID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],
  desc: String, // 목표 내용
  createdAt: { type: Date, default: new Date() },
});

const model = mongoose.model("Goal", GoalSchema);

export default model;
