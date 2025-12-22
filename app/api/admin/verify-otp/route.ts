import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OTP from "@/models/OTP";

const ADMIN_EMAIL = "sibikarthi7@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "OTP code is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find OTP
    const otpRecord = await OTP.findOne({
      email: ADMIN_EMAIL.toLowerCase(),
      code,
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { error: "OTP code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Delete OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error: any) {
    console.error("Admin verify OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

