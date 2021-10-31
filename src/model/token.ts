import { Schema, Document, model, Types, Model } from "mongoose";
import { hash, compare } from "bcrypt";

interface IToken {
  token: string;
  student_id: Types.ObjectId;
  createdAt: string;
}

interface TokenDocument extends Document, IToken {
  verify: (otp: string) => Promise<boolean>;
}

const token_schema_fields: Record<keyof IToken, any> = {
  student_id: {
    type: Types.ObjectId,
    ref: "Student",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "5m",
  },
};

const TokenSchema = new Schema<TokenDocument>(token_schema_fields, {
  timestamps: true,
});

TokenSchema.pre("save", async function (this: TokenDocument, next) {
  if (this.isModified("token")) {
    this.token = await hash(this.token, 10);
  }
  next();
});

TokenSchema.method(
  "verify",
  async function (this: TokenDocument, otp: string): Promise<boolean> {
    return await compare(otp, this.token);
  }
);

export default model<TokenDocument, Model<TokenDocument>>("Token", TokenSchema);
