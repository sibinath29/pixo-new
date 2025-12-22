import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail, verifyEmailConfig } from "@/lib/email";

const ADMIN_EMAIL = "pixo.shopoff@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    // Validate all fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Verify email configuration first
    const isEmailConfigured = await verifyEmailConfig();
    if (!isEmailConfigured) {
      console.error("Email configuration verification failed");
      return NextResponse.json(
        { success: false, error: "Email service is not properly configured. Please contact the administrator." },
        { status: 500 }
      );
    }

    console.log(`Attempting to send contact email from ${email} to ${ADMIN_EMAIL}`);

    // Send email using the shared email function
    const emailSent = await sendContactEmail(ADMIN_EMAIL, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    if (!emailSent) {
      console.error("Failed to send contact email - sendContactEmail returned false");
      return NextResponse.json(
        { success: false, error: "Failed to send message. The email service may be temporarily unavailable. Please try again later or contact us directly at pixo.shopoff@gmail.com" },
        { status: 500 }
      );
    }

    console.log(`Contact email sent successfully from ${email} to ${ADMIN_EMAIL}`);

    return NextResponse.json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    });
  } catch (error: any) {
    console.error("Error in contact API route:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack,
    });
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send message. Please try again later or contact us directly at pixo.shopoff@gmail.com" },
      { status: 500 }
    );
  }
}

