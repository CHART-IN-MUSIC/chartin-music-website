import mongoose from "mongoose";

const { Schema } = mongoose;

const FaqSchema = new Schema(
  {
    title: String, // 제목
    desc: String, // 내용
  },
  { timestamps: true } // 만든시간, 업데이트시간
);

const model = mongoose.model("Faq", FaqSchema);

export default model;
