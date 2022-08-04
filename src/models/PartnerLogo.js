import mongoose from "mongoose";

const { Schema } = mongoose;

const PartnerLogoSchema = new Schema({
  img: String, // 파트너 로고 이미지
  name: String, // 파트너사 이름
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,
});

const model = mongoose.model("PartnerLogo", PartnerLogoSchema);

export default model;
