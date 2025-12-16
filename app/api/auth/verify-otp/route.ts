import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OTP from "@/models/OTP";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find OTP
    // Cast query to `any` to satisfy Mongoose's strict TypeScript typings
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      code,
    } as any);

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id } as any);
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Mark OTP as verified (don't delete yet - will be deleted after registration)
    // Cast query to `any` to satisfy Mongoose's strict TypeScript typings
    await OTP.updateOne(
      { _id: otpRecord._id } as any,
      { verified: true }
    );

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

