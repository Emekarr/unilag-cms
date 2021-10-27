import { Schema, model, Model, Document, Types } from "mongoose";

interface IChannel {
  name: string;
  workspace: { type: typeof Types.ObjectId; ref: string; required: true };
  compulsory: boolean;
}

export interface ChannelDocument extends IChannel, Document {
  subscribers: Types.ObjectId[];
  getSubscribersNumber: () => number;
}

const ChannelSchema = new Schema<ChannelDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30,
    minlength: 3,
  },
  workspace: {
    type: Types.ObjectId,
    ref: "WorkSpace",
    required: true,
  },
  compulsory: {
    type: Boolean,
    default: true,
  },
  subscribers: [
    {
      subscriber: {
        type: Types.ObjectId,
        ref: "Student",
        required: true,
      },
    },
  ],
});

ChannelSchema.method("getSubscribersNumber", function (this: ChannelDocument) {
  return this.subscribers.length;
});

ChannelSchema.method("toJSON", function (this: ChannelDocument) {
  const channel = this.toObject();
  delete channel.__v;
  return channel;
});

export default model<ChannelDocument, Model<ChannelDocument>>(
  "Channel",
  ChannelSchema
);
