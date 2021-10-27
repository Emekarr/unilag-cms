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
  password?: string;
}

interface Student extends IStudent {
  auth_tokens?: {
    token: string;
    refresh_token: string;
    createdAt: number;
    ip_address: string;
  }[];
  refresh_tokens?: { token: string; createdAt: number; ip_address: string }[];
  verified_phone: boolean;
  otp: number | null;
  recovery_otp: number;
  expireAt?: {
    type: DateConstructor;
    default: () => number;
    expires: number | null;
  } | null;
  admin: boolean;
  workspaces: { workspace_name: string }[];
}

export interface StudentDocument extends Document, Student {
  generateToken(
    ip_address: string
  ): Promise<{ auth_token: string; refresh_token: string }>;
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
        refresh_token: {
          type: String,
          required: true,
        },
        ip_address: {
          type: String,
          required: true,
        },
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
        ip_address: {
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
      { id: this._id },
      process.env.JWT_REFRESH_KEY!,
      { expiresIn: "730h" }
    );
    const auth_token = jwt.sign(
      { id: this._id, refresh_token },
      process.env.JWT_AUTH_KEY!,
      { expiresIn: "4h" }
    );

    this.refresh_tokens!.push({
      token: refresh_token,
      createdAt: Date.now(),
      ip_address,
    });
    this.auth_tokens!.push({
      token: auth_token,
      refresh_token,
      createdAt: Date.now(),
      ip_address,
    });
    await this.save();
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
  delete student.auth_tokens;
  delete student.refresh_tokens;
  delete student.expireAt;
  delete student.password;
  return student;
});

export default model<StudentDocument, Model<StudentDocument>>(
  "Student",
  StudentSchema
);
