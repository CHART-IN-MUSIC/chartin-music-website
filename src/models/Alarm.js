import mongoose from "mongoose";

const { Schema } = mongoose;

const AlarmSchema = new Schema({
  // 알림 대상
  userID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  link: String, // 연결할 링크
  read: { type: Boolean, default: false }, // 확인 여부
  desc: String, // 알림 내용
  createdAt: { type: Date, default: new Date() },
});

const model = mongoose.model("Alarm", AlarmSchema);

export default model;
