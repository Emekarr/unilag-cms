import { Server, Socket } from "socket.io";
import { isValidObjectId } from "mongoose";

import { JoinAllRoomsType } from "../types/socket_types/socket_types";

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
    this.socket.on("join_all_room", (data: JoinAllRoomsType) => {
      try {
        data.channel_ids.forEach((id) => {
          if (!isValidObjectId(id))
            throw new Error("Invalid channel id passed");
          this.socket.join(id);
        });
      } catch (err) {
        this.socket.emit("error", err.message);
      }
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
