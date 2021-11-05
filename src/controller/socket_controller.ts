import { Server } from "socket.io";

export default class SocketController {
  constructor(io: Server) {
    io.on("connection", (socket) => {});
  }
}
