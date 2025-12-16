import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { generateToken } from "@/lib/jwt";
import { validatePassword } from "@/lib/passwordValidation";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, otpCode } = await req.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please provide all fields" },
        { status: 400 }
      );
    }

    // Password strength validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(". ") },
        { status: 400 }
      );
    }

    // Connect to DB
    await connectDB();

    // Check if user exists
    // Cast query to `any` to satisfy Mongoose's strict TypeScript typings
    const existingUser = await User.findOne({ email } as any);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Verify OTP if provided
    let emailVerified = false;
    if (otpCode) {
      const otpRecord = await OTP.findOne({ email: email.toLowerCase(), code: otpCode });

      if (otpRecord && new Date() <= otpRecord.expiresAt) {
        emailVerified = true;

        // Mark OTP as verified if not already, then delete
        if (!otpRecord.verified) {
          await OTP.updateOne({ _id: otpRecord._id }, { verified: true });
        }
        await OTP.deleteOne({ _id: otpRecord._id });
      } else {
        return NextResponse.json(
          { error: "Invalid or expired OTP. Please verify your email first." },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      emailVerified,
      emailVerifiedAt: emailVerified ? new Date() : null,
    });

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Return response without password
    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image || null,
          emailVerified: user.emailVerified,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
