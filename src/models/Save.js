import mongoose from "mongoose";

const { Schema } = mongoose;

const SaveSchema = new Schema({
  status: String, // Pending Approval=>정산 전 / Completed=>정산완료
  type: String, // plus, minus [적립인지 인출인지 구분하기 위한 타입]
  requestType: String, // Feedback, Promotion, Mix/Master, Withdrawal [요청 또는 인출 타입]
  musicianName: String, // 결제한 뮤지션 이름
  amount: Number, // 금액
  company: String, // paypal, payoneer
  accountEmail: String, // 예금주 이메일
  vat: Number, // vat
  bankName: String, // 은행명
  accountHolder: String, //예금주
  accountNumber: Number, // 계좌번호
  address: String, // 주소
  expertID: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
    },
  ],
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,
  searchByMonth: String,
});

const model = mongoose.model("Save", SaveSchema);

export default model;
