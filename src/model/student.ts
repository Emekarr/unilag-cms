import { Schema, model, Document, Model, Types } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import AuthToken from "./auth_token";
import RefreshToken from "./refresh_token";

export interface IStudent {
  firstname: string;
  lastname: string;
  username: string | null;
  department: string;
  matric_no: string;
  phone: string;
  password?: string;
}

interface Student extends IStudent {
  profile_image: Buffer;
  verified_phone: boolean;
  recovery_otp: number;
  class_rep: boolean;
  createdAt?: number | null;
  workspaces: Types.ObjectId[];
  electives: Types.ObjectId[];
}

export interface StudentDocument extends Document, Student {
  generateToken(
    ip_address: string
  ): Promise<{ auth_token: string; refresh_token: string }>;
}

const student_schema_fields: Record<keyof Student, any> = {
  firstname: {
    type: String,
    required: true,
    maxlength: 30,
    minlength: 2,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    maxlength: 30,
    minlength: 2,
    trim: true,
  },
  username: {
    type: String,
    maxlength: 20,
    minlength: 2,
    trim: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
    maxlength: 30,
    minlength: 2,
    trim: true,
  },
  matric_no: {
    type: String,
    required: true,
    maxlength: 9,
    minlength: 9,
    trim: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    maxlength: 30,
    minlength: 2,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified_phone: {
    type: Boolean,
    default: false,
  },
  class_rep: {
    type: Boolean,
    default: false,
  },
  recovery_otp: Number,
  createdAt: {
    type: Date,
    default: Date.now,
    // expires: "5m",
  },
  profile_image: Buffer,
  workspaces: [
    {
      type: Types.ObjectId,
      ref: "WorkSpace",
      unique: true,
    },
  ],
  electives: [
    {
      type: Types.ObjectId,
      ref: "WorkSpace",
      unique: true,
    },
  ],
};

const StudentSchema = new Schema(student_schema_fields, {
  timestamps: true,
});

StudentSchema.method(
  "generateToken",
  async function (this: StudentDocument, ip_address: string) {
    const refresh_token = jwt.sign(
      { id: this._id },
      process.env.JWT_REFRESH_KEY!,
      { expiresIn: "730h" }
    );
    const auth_token = jwt.sign(
      { id: this._id, refresh_token },
      process.env.JWT_AUTH_KEY!,
      { expiresIn: "4h" }
    );

    await new RefreshToken({
      token: refresh_token,
      createdAt: Date.now(),
      ip_address,
      owner: this._id,
    }).save();
    await new AuthToken({
      token: auth_token,
      refresh_token,
      createdAt: Date.now(),
      ip_address,
      owner: this._id,
    }).save();

    return { auth_token, refresh_token };
  }
);

StudentSchema.pre("save", async function (this: StudentDocument, next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password!, 10);
  }
  next();
});

StudentSchema.method("toJSON", function (this: StudentDocument) {
  const student = this.toObject();
  delete student.__v;
  delete student.createdAt;
  delete student.password;
  return student;
});

export default model<StudentDocument>("Student", StudentSchema);
