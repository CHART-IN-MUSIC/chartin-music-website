import mongoose from "mongoose";

const { Schema } = mongoose;

const ConferenceSchema = new Schema({
  title: String, // 컨퍼런스 제목
  desc: String, // 컨퍼런스 내용
  conferenceFile: String, // 첨부파일 (이미지)
  category: String, // 컨퍼런스 카테고리
  userID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],
  commentID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Comment",
    },
  ],
  conferenceLikeID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "ConferenceLike",
    },
  ],
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,
});

const model = mongoose.model("Conference", ConferenceSchema);

export default model;
