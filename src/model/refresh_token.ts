import { Schema, Document, model, Types } from "mongoose";

interface IRefreshToken {
  token: string;
  ip_address: string;
  createdAt: number;
  owner: Types.ObjectId;
}

interface RefreshToken extends IRefreshToken, Document {}

const refresh_token_fields: Record<keyof IRefreshToken, any> = {
  owner: {
    type: Types.ObjectId,
    ref: "Student",
    required: true,
  },
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
    expires: process.env.REFRESH_TOKEN_LIFE,
  },
};

const RefreshTokenSchema = new Schema(refresh_token_fields, {
  timestamps: true,
});

export default model<RefreshToken>("RefreshToken", RefreshTokenSchema);
