import { Schema, model, Model, Document, Types } from "mongoose";

export interface IChannel {
  name: string;
  workspace: Types.ObjectId;
  compulsory: boolean;
  creator: Types.ObjectId;
}

interface Channel extends IChannel {
  subscribers: Types.ObjectId[];
}

export interface ChannelDocument extends Channel, Document {
  getSubscribersNumber: () => number;
}

const channel_schema_fields: Record<keyof Channel, any> = {
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
  creator: {
    type: Types.ObjectId,
    ref: "Student",
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
};

const ChannelSchema = new Schema<IChannel>(channel_schema_fields, {
  timestamps: true,
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
