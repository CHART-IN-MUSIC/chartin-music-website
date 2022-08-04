import mongoose from "mongoose";

const { Schema } = mongoose;

const MissionSchema = new Schema({
  imgUrl: String, // 배경이미지
  category: String, // 카테고리
  mission: String, // 미션내용
  createdAt: { type: Date, default: new Date() },
  updatedAt: Date,

  // 데이터 가공용
  status: String, // doing, complete [상태 : 진행중, 완료]
  start: Date, // 해당 미션 Start 날짜
  color: String, // 보여지는 문구, 보더 색상
});

const model = mongoose.model("Mission", MissionSchema);

export default model;
