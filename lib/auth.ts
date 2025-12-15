import { NextRequest } from "next/server";
import { verifyToken, getTokenFromRequest } from "./jwt";
import connectDB from "./db";
import User from "@/models/User";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    await connectDB();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
    };
  } catch (error) {
    return null;
  }
}




