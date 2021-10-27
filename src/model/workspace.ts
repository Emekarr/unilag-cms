import { model, Model, Schema, Document, Types } from "mongoose";

export interface IWorkSpace {
  name: string;
  department: string;
  year: number;
  timetable: Buffer | null;
}

export interface WorkSpaceDocument extends Document, IWorkSpace {
  creator: { type: typeof Types.ObjectId; red: string; required: true };
  channels: Types.ObjectId[];
  members: Types.ObjectId[];
}

const WorkSpaceSchema = new Schema<WorkSpaceDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
      minlength: 2,
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
    timetable: Buffer,
    creator: {
      type: Types.ObjectId,
      red: "Student",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

WorkSpaceSchema.virtual("members", {
  ref: "Student",
  localField: "_id",
  foreignField: "workspaces",
});

WorkSpaceSchema.method("toJSON", function (this: WorkSpaceDocument) {
  const workspace = this.toObject();
  delete workspace.__v;
  return workspace;
});

export default model<WorkSpaceDocument, Model<WorkSpaceDocument>>(
  "WorkSpace",
  WorkSpaceSchema
);
