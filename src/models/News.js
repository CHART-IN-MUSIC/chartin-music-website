import mongoose from "mongoose";

const { Schema } = mongoose;

const NewsSchema = new Schema({
  title: String, // 기사 제목
  newsImg: String, // 뉴스 이미지
  shortDesc: String, // 간략한 설명(이미지 제목 하단 들어갈 내용)
  desc: String, // 시가 내용(에디팅 영역)
  hide: { type: Boolean, default: false },
  newsCategoryID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "NewsCategory",
    },
  ],
  region: String, // 지역
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,
});

const model = mongoose.model("News", NewsSchema);

export default model;
