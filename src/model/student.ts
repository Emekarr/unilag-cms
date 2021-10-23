import {
  Schema,
  model,
  Document,
  SchemaDefinitionProperty,
  Model,
  Types,
} from "mongoose";
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
  tokens: { token: string }[];
  verified_email: boolean;
  otp: number;
  expire_at: SchemaDefinitionProperty<DateConstructor>;
  admin: boolean;
  workspaces: string;
}

interface StudentDocument extends Document, Student {
  generateToken(): Promise<string>;
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
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    verified_email: {
      type: Boolean,
      default: false,
    },
    otp: Number,
    expire_at: {
      type: Date,
      default: Date.now,
      expires: process.env.DELETE_UNVERIFIED_ACCOUNT_TIME,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    workspaces: [
      {
        worspace: {
          type: Types.ObjectId,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

StudentSchema.method("generateToken", async function (this: StudentDocument) {
  const token = jwt.sign({ id: this._id }, process.env.JWT_KEY!);
  this.tokens.push({ token });
  await this.save();
  return token;
});

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
