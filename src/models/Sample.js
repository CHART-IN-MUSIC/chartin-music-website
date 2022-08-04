import mongoose from "mongoose";

const { Schema } = mongoose;

const SampleSchema = new Schema({
  thumbnail: String,
  data1: String,
  data2: String,
  data3: String,
  data4: String,
  data5: String,
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,
});

const model = mongoose.model("Sample", SampleSchema);

export default model;
