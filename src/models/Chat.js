import mongoose from "mongoose";

const { Schema } = mongoose;

const ChatSchema = new Schema({
  musicianID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  expertID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  mUnread: { type: Number, default: 0 }, // 뮤지션 안읽은 메시지 수
  eUnread: { type: Number, default: 0 }, // 전문가 안읽은 메시지 수
  lastMessage: String, // 마지막 메시지
  talk: String, // 대화 내용
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,
});

const model = mongoose.model("Chat", ChatSchema);

export default model;
