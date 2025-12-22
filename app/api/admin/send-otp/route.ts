import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OTP from "@/models/OTP";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";

const ADMIN_EMAIL = "sibikarthi7@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "pixo2024";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    // First verify the password
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    await connectDB();

    // Generate OTP
    const code = generateOTP();
    const expiresAt = getOTPExpiry();

    // Delete any existing OTPs for admin email
    await OTP.deleteMany({ email: ADMIN_EMAIL.toLowerCase() });

    // Save new OTP
    await OTP.create({
      email: ADMIN_EMAIL.toLowerCase(),
      code,
      expiresAt,
    });

    // Send email to admin
    const emailSent = await sendOTPEmail(ADMIN_EMAIL, code, true);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please check your email configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${ADMIN_EMAIL}`,
    });
  } catch (error: any) {
    console.error("Admin send OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

