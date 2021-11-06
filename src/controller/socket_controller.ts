import { Server, Socket } from "socket.io";
import { isValidObjectId } from "mongoose";

import Channel from "../model/channels";
import Message from "../model/message";
import {
  JoinAllRoomsType,
  MessageType,
} from "../types/socket_types/socket_types";

export default class SocketController {
  private socket: Socket;
  constructor(private io: Server) {
    io.on("connection", (socket) => {
      this.socket = socket;
      this.joinAllRoom();
      this.exitAllRoom();
      // this.sendMessage();
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

  // private sendMessage() {
  //   this.socket.on("send_message", async (data: MessageType) => {
  //     try {
  //       const channel = await Channel.findById(data.channel);
  //       if (!channel) throw new Error("Channel does not exist");
  //       const message = new Message(data);
  //       message
  //         .save()
  //         .then((message) => {
  //           this.socket.broadcast
  //             .to(data.channel)
  //             .emit("recieve_message", message);
  //         })
  //         .catch((err) => {
  //           throw new Error(`Sending message failed : ${err.message}`);
  //         });
  //     } catch (err) {
  //       this.socket.emit("error", err.message);
  //     }
  //   });
  // }
}
