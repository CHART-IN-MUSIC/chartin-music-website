import mongoose from "mongoose";

const { Schema } = mongoose;

const BlockListSchema = new Schema({
  // 차단한 이메일주소
  email: String,
  createdAt: { type: Date, default: new Date() },
});

const model = mongoose.model("BlockList", BlockListSchema);

export default model;
