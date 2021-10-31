import { Schema, Document, model, Types } from "mongoose";

interface IAuthToken {
  refresh_token: string;
  token: string;
  ip_address: string;
  createdAt: number;
  owner: Types.ObjectId;
}

interface AuthToken extends IAuthToken, Document {}

const auth_token_fields: Record<keyof IAuthToken, any> = {
  owner: {
    type: Types.ObjectId,
    ref: "Student",
    required: true,
  },
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
    expires: process.env.AUTH_TOKEN_LIFE,
  },
};

const AuthTokenSchema = new Schema(auth_token_fields, { timestamps: true });

export default model<AuthToken>("AuthToken", AuthTokenSchema);
