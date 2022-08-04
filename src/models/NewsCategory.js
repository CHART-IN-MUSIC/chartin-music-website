import mongoose from "mongoose";

const { Schema } = mongoose;

const NewsCategorySchema = new Schema({
  category: String, // 카테고리 이름
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,
});

const model = mongoose.model("NewsCategory", NewsCategorySchema);

export default model;
