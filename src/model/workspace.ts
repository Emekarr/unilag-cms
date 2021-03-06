import { model, Model, Schema, Document, Types } from "mongoose";

import { Channel } from "./channels";

export interface IWorkSpace {
  name: string;
  department: string;
  year: number;
  timetable: Buffer | null;
  creator: Types.ObjectId;
  admins: Types.ObjectId[];
}

export interface WorkSpaceDocument extends Document, IWorkSpace {
  channels: Types.ObjectId[];
  members: Types.ObjectId[];
  getMembersCount: () => number;
  getChannelList: () => Channel[];
}

const workspace_schema_fields: Record<keyof IWorkSpace, any> = {
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30,
    minlength: 2,
    unique: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30,
    minlength: 2,
  },
  year: {
    type: Number,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 4,
  },
  timetable: {
    type: Buffer,
    default: null,
  },
  creator: {
    type: Types.ObjectId,
    red: "Student",
    required: true,
  },
  admins: [
    {
      type: Types.ObjectId,
      red: "Student",
      required: true,
    },
  ],
};

const WorkSpaceSchema = new Schema(workspace_schema_fields, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
});

WorkSpaceSchema.virtual("members", {
  ref: "Student",
  localField: "_id",
  foreignField: "workspaces.workspace",
});

WorkSpaceSchema.virtual("channels", {
  ref: "Channel",
  localField: "_id",
  foreignField: "workspace",
});

WorkSpaceSchema.method("toJSON", function (this: WorkSpaceDocument) {
  const workspace = this.toObject();
  delete workspace.__v;
  return workspace;
});

WorkSpaceSchema.method(
  "getMembersCount",
  async function (this: WorkSpaceDocument) {
    await this.populate("members");
    return this.members.length;
  }
);

WorkSpaceSchema.method(
  "getChannelList",
  async function (this: WorkSpaceDocument) {
    await this.populate("channels");
    return this.channels;
  }
);

export default model<WorkSpaceDocument>("WorkSpace", WorkSpaceSchema);
