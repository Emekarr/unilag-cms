import { Schema, model, Document, Model, Types } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export interface IStudent {
  firstname: string;
  lastname: string;
  username: string | null;
  department: string;
  matric_no: string;
  phone: string;
  password: string;
}

interface Student extends IStudent {
  auth_tokens: { token: string; refresh_token: string; createdAt: number }[];
  refresh_tokens: { token: string; createdAt: number }[];
  verified_phone: boolean;
  otp: number | null;
  recovery_otp: number;
  expireAt: {
    type: DateConstructor;
    default: () => number;
    expires: number | null;
  } | null;
  admin: boolean;
  workspaces: string;
}

export interface StudentDocument extends Document, Student {
  generateToken(): Promise<{ auth_token: string; refresh_token: string }>;
}

const StudentSchema = new Schema<StudentDocument>(
  {
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
    auth_tokens: [
      {
        token: {
          type: String,
          required: true,
        },
        refresh_token: String,
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 14400,
        },
      },
    ],
    refresh_tokens: [
      {
        token: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 7884008,
        },
      },
    ],
    verified_phone: {
      type: Boolean,
      default: false,
    },
    recovery_otp: Number,
    expireAt: {
      type: Date,
      default: Date.now,
      expires: 300,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    workspaces: [
      {
        type: Types.ObjectId,
        ref: "WorkSpace",
      },
    ],
  },
  {
    timestamps: true,
  }
);

StudentSchema.method(
  "generateToken",
  async function (this: StudentDocument, ip_address: string) {
    const refresh_token = jwt.sign(
      { id: this._id, ip_address },
      process.env.JWT_REFRESH_KEY!
    );
    const auth_token = jwt.sign(
      { id: this._id, ip_address, refresh_token },
      process.env.JWT_AUTH_KEY!
    );

    this.refresh_tokens.push({
      token: refresh_token,
      createdAt: Date.now(),
    });
    this.auth_tokens.push({
      token: auth_token,
      refresh_token,
      createdAt: Date.now(),
    });
    await this.save();
    return { auth_token, refresh_token };
  }
);

StudentSchema.pre("save", async function (this: StudentDocument, next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default model<StudentDocument, Model<StudentDocument>>(
  "Student",
  StudentSchema
);
