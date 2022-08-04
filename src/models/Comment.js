import mongoose from "mongoose";

const { Schema } = mongoose;

const CommentSchema = new Schema({
  desc: String, // comment 내용
  // comment와 관련된 conference
  conferenceID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Conference",
    },
  ],
  // comment 작성자
  userID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],
  // 댓글에 달린 대댓글들
  recommentID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Recomment",
    },
  ],
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,
});

const model = mongoose.model("Comment", CommentSchema);

export default model;
