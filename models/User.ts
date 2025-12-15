
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image?: string;
<<<<<<< HEAD
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
=======
  emailVerified?: boolean | null;
  emailVerifiedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
>>>>>>> db9cbf1 (Fix Mongoose query type for products API)
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: null },

    // REQUIRED FOR YOUR REGISTER CODE
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
