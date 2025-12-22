import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OTP from "@/models/OTP";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate OTP
    const code = generateOTP();
    const expiresAt = getOTPExpiry();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() } as any);

    // Save new OTP
    await OTP.create({
      email: email.toLowerCase(),
      code,
      expiresAt,
    });

    // Send email
    const emailSent = await sendOTPEmail(email, code, false);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please check your email configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
