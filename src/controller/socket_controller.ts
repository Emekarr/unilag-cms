import { Server, Socket } from "socket.io";
import { isValidObjectId } from "mongoose";

import Channel from "../model/channels";
import Message from "../model/message";
import {
  JoinAllRoomsType,
  MessageType,
} from "../types/socket_types/socket_types";

export default class SocketController {
  constructor(private io: Server) {
    this.io.on("connection", (socket) => {
      this.joinAllRoom(socket);
      this.exitAllRoom(socket);
      this.joinRoom(socket);
      this.exitRoom(socket);
      this.sendMessage(socket);
    });
  }

  private emitError(err: any, socket: Socket) {
    socket.emit("error", err.message);
  }

  private joinAllRoom(socket: Socket) {
    socket.on("join_all_rooms", (data: JoinAllRoomsType) => {
      try {
        data.channel_ids.forEach((id) => {
          if (!isValidObjectId(id))
            throw new Error("Invalid channel id passed");
          socket.join(id);
        });
      } catch (err) {
        this.emitError(err, socket);
      }
    });
  }

  private exitAllRoom(socket: Socket) {
    socket.on("exit_all_rooms", () => {
      const rooms = [...socket.rooms];
      rooms.forEach((room) => {
        if (rooms.indexOf(room) === 0) return;
        socket.leave(room);
      });
    });
  }

  private joinRoom(socket: Socket) {
    socket.on("join_room", async (room: string) => {
      try {
        if (!isValidObjectId(room))
          throw new Error("Invalid channel id passed");
        socket.join(room);
      } catch (err) {
        this.emitError(err, socket);
      }
    });
  }

  private exitRoom(socket: Socket) {
    socket.on("exit_room", (room: string) => {
      try {
        if (!isValidObjectId(room))
          throw new Error("Invalid channel id passed");
        socket.leave(room);
      } catch (err) {
        this.emitError(err, socket);
      }
    });
  }

  private sendMessage(socket: Socket) {
    socket.on("send_message", async (data: MessageType) => {
      try {
        if (!data.channel || !data.message || !data.sender)
          throw new Error(
            "Please provide the neccessary information needed to send a message"
          );
        const is_member = socket.rooms.has(data.channel);
        if (!is_member)
          throw new Error(
            "You are not a member of this socket room and cannot send a message to this room"
          );
        const channel = await Channel.findById(data.channel);
        if (!channel) throw new Error("Channel does not exist");
        const message = new Message(data);
        message
          .save()
          .then((message) => {
            socket.to(data.channel).emit("recieve_message", message);
          })
          .catch((err) => {
            throw new Error(`Sending message failed : ${err.message}`);
          });
      } catch (err) {
        this.emitError(err, socket);
      }
    });
  }
}
