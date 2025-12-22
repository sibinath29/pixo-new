import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OTP from "@/models/OTP";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and OTP code are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      code,
    } as any);

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id } as any);
      return NextResponse.json(
        { error: "OTP code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark as verified and delete
    await OTP.updateOne({ _id: otpRecord._id } as any, { verified: true });
    await OTP.deleteOne({ _id: otpRecord._id } as any);

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
