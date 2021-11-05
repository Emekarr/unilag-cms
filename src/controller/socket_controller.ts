import { Server, Socket } from "socket.io";

interface RoomAction {
  channel_ids: string[];
}

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
    this.socket.on("join_room", (data: RoomAction) => {
      data.channel_ids.forEach((id) => {
        this.socket.join(id);
      });
    });
  }

  private exitAllRoom() {
    this.socket.on("exit_room", (data: RoomAction) => {
      this.socket.rooms.forEach((room) => {
        this.socket.leave(room);
      });
    });
  }
}
