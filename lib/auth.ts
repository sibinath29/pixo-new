import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken, getTokenFromRequest } from "@/lib/jwt";

export async function getAuthUser(req: NextRequest) {
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

    const user = await User.findById(decoded.userId as any);

    if (!user) {
      return null;
    }

    // Return user data (without password)
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    console.error("Get auth user error:", error);
    return null;
  }
}
