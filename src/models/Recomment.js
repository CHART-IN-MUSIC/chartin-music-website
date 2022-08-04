import mongoose from "mongoose";

const { Schema } = mongoose;

const RecommentSchema = new Schema({
  desc: String, // Recomment 내용
  // Recomment 작성자
  userID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],
  // 대댓글을 단 댓글
  commentID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Comment",
    },
  ],
  createdAt: { type: Date, default: new Date() },
});

const model = mongoose.model("Recomment", RecommentSchema);

export default model;
