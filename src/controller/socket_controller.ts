import { Server, Socket } from "socket.io";

export default class SocketController {
  private socket: Socket;
  constructor(private io: Server) {
    io.on("connection", (socket) => {
      this.socket = socket;
      this.joinAllRoom();
      this.exitAllRoom();
    });
  }

  private joinAllRoom() {
    this.socket.on("join_all_room", (data: { channel_ids: string[] }) => {
      data.channel_ids.forEach((id) => {
        this.socket.join(id);
      });
    });
  }

  private exitAllRoom() {
    this.socket.on("exit_all_room", () => {
      const rooms = [...this.socket.rooms];
      rooms.forEach((room) => {
        if (rooms.indexOf(room) === 0) return;
        this.socket.leave(room);
      });
    });
  }
}
