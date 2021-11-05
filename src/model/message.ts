import { Schema, model, Document, Types } from "mongoose";

export interface IMessage {
  sender: Types.ObjectId;
  channel: Types.ObjectId;
  message: string;
}

export interface MessageDocument extends IMessage, Document {}

const message_schema_fields: Record<keyof IMessage, any> = {
  sender: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
};

const MessageSchema = new Schema(message_schema_fields, { timestamps: true });

export default model<MessageDocument>("Message", MessageSchema);
