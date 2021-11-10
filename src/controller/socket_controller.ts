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
      this.joinRoom();
      this.exitRoom();
      this.sendMessage();
    });
  }

  private emitError(err: any) {
    this.socket.emit("error", err.message);
  }

  private joinAllRoom() {
    this.socket.on("join_all_rooms", (data: JoinAllRoomsType) => {
      try {
        data.channel_ids.forEach((id) => {
          if (!isValidObjectId(id))
            throw new Error("Invalid channel id passed");
          this.socket.join(id);
        });
        console.log(this.socket.rooms);
      } catch (err) {
        this.emitError(err);
      }
    });
  }

  private exitAllRoom() {
    this.socket.on("exit_all_rooms", () => {
      const rooms = [...this.socket.rooms];
      rooms.forEach((room) => {
        if (rooms.indexOf(room) === 0) return;
        this.socket.leave(room);
      });
    });
  }

  private joinRoom() {
    this.socket.on("join_room", (room: string) => {
      try {
        if (!isValidObjectId(room))
          throw new Error("Invalid channel id passed");
        this.socket.join(room);
      } catch (err) {
        this.emitError(err);
      }
    });
  }

  private exitRoom() {
    this.socket.on("exit_room", (room: string) => {
      try {
        if (!isValidObjectId(room))
          throw new Error("Invalid channel id passed");
        this.socket.leave(room);
      } catch (err) {
        this.emitError(err);
      }
    });
  }

  private sendMessage() {
    // this.socket.on("send_message", async (data: MessageType) => {
    //   try {
    //     if (!data.channel || !data.message || !data.sender)
    //       throw new Error(
    //         "Please provide the neccessary information needed to send a message"
    //       );
    //     const channel = await Channel.findById(data.channel);
    //     if (!channel) throw new Error("Channel does not exist");
    //     const message = new Message(data);
    //     message
    //       .save()
    //       .then((message) => {
    //         this.socket.broadcast.to(data.channel).emit("recieve", message);
    //       })
    //       .catch((err) => {
    //         throw new Error(`Sending message failed : ${err.message}`);
    //       });
    //   } catch (err) {
    //     this.emitError(err);
    //   }
    // });
  }
}
