import { io } from "../socket";

class SocketController {
  private socket;
  constructor() {
    io.on("connection", (socket) => {
      this.socket = socket;
    });
  }
}

export default new SocketController();
