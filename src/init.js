import dotenv from "dotenv";
import "./db";
import app from "./app";

dotenv.config();

const { PORT } = process.env;

const handleListening = () => console.log(`Listening on port: ${PORT}`);

const server = app.listen(PORT, handleListening);

const listen = require("socket.io");

const io = listen(server);
io.on("connection", (socket) => {
  socket.on("client message", (data1, data2, data3) => {
    io.emit("server message", data1.message, data2.userRole, data3.firstBool);
  });
});
io.on("disconnect", (socket) => {
  // console.log(socket.id);
});
