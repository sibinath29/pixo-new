import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { generateToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, otpCode } = await req.json();

    if (!name || !email || !password || !otpCode) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() } as any);

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Verify OTP was verified
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      code: otpCode,
      verified: true,
    } as any);

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or unverified OTP code. Please verify your email first." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });

    // Delete OTP after successful registration
    await OTP.deleteOne({ _id: otpRecord._id } as any);

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Return user data (without password)
    const userData = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
    };

    return NextResponse.json({
      success: true,
      token,
      user: userData,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
