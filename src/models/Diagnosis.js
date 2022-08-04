import mongoose from "mongoose";

const { Schema } = mongoose;

const DiagnosisSchema = new Schema({
  result: Object,
  randomNum: Number,
  createdAt: { type: Date, default: new Date() },
});

const model = mongoose.model("Diagnosis", DiagnosisSchema);

export default model;
