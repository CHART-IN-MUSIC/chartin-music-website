import mongoose from "mongoose";

const { Schema } = mongoose;

const MainVideoSchema = new Schema({
  type: String, // 영상 타입 - 유튜브 or 틱톡
  thumbnail: String, // 썸네일 이미지
  videoID: String, // 영상 아이디
  title: String, // 영상 제목
  expertID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ], // 해당 영상을 제작한 전문가 유저
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,
});

const model = mongoose.model("MainVideo", MainVideoSchema);

export default model;
