import { Schema, Document, model, Types, Model } from "mongoose";
import { hash, compare } from "bcrypt";

interface IToken {
  token: string;
}

interface TokenDocument extends Document, IToken {
  student_id: { type: typeof Types.ObjectId; ref: string; required: true };
  token: string;
  createdAt: { type: DateConstructor; default: () => number; expires: number };
  verify: (otp: string) => Promise<boolean>;
}

const TokenSchema = new Schema<TokenDocument>({
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
    expires: 300,
  },
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
