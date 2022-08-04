import mongoose from "mongoose";

const { Schema } = mongoose;

const PurchaseSchema = new Schema({
  paymentOrderID: String, // Faster Pay에서 부여하는 고유 아이디 값
  type: String, // feedback, promotion, mixmaster, subscribe, customized [피드백, 프로모션, 믹마, 구독, 직접결제]
  feedbackType: String, // trend, technical [feedback일 경우 타입]
  status: String, // pre, successful, cancelled  [결제 상태 : 결제전, 성공, 취소]
  description: String,
  amount: String,
  currency: String,
  merchant_order_id: String,
  // 결제한 뮤지션
  musicianID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],
  feedbackID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Feedback",
    },
  ],
  promotionID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Promotion",
    },
  ],
  mixmasterID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "MixMaster",
    },
  ],
  // 선택된 제안
  proposalID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Proposal",
    },
  ],
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,
});

const model = mongoose.model("Purchase", PurchaseSchema);

export default model;
