import mongoose from "mongoose";

const { Schema } = mongoose;

const LikeSchema = new Schema({
  // Like 관련된 musicianID = userID
  toUser: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],
  // Like 클릭한 유저
  fromUser: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],
  createdAt: { type: Date, default: new Date() },
});

const model = mongoose.model("Like", LikeSchema);

export default model;
