import mongoose from "mongoose";

const { Schema } = mongoose;

const ConferenceLikeSchema = new Schema({
  // ConferenceLike와 관련된 conferenceID
  conferenceID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Conference",
    },
  ],
  // ConferenceLike 클릭한 유저
  fromUser: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],
  createdAt: { type: Date, default: new Date() },
});

const model = mongoose.model("ConferenceLike", ConferenceLikeSchema);

export default model;
