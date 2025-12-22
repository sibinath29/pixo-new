import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Create transporter using the same configuration as other email functions
let transporter: nodemailer.Transporter | null = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
} else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

const ADMIN_EMAIL = "pixo.shopoff@gmail.com";

export async function POST(req: NextRequest) {
  try {
    if (!transporter) {
      return NextResponse.json(
        { success: false, error: "Email service not configured" },
        { status: 500 }
      );
    }

    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Send email to admin
    const mailOptions = {
      from: `"Pixo Contact Form" <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #08f7fe; font-size: 32px; margin: 0;">PIXO</h1>
            <p style="color: #08f7fe; margin: 5px 0;">Posters & Polaroids</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(8, 247, 254, 0.3); border-radius: 12px; padding: 30px;">
            <h2 style="color: #08f7fe; margin-top: 0;">New Contact Form Submission</h2>
            
            <div style="margin-bottom: 20px;">
              <p style="color: #08f7fe; font-weight: bold; margin-bottom: 5px;">From:</p>
              <p style="color: #fff; margin: 0;">${name} (${email})</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="color: #08f7fe; font-weight: bold; margin-bottom: 5px;">Subject:</p>
              <p style="color: #fff; margin: 0;">${subject}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="color: #08f7fe; font-weight: bold; margin-bottom: 5px;">Message:</p>
              <p style="color: #fff; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="color: #999; font-size: 14px; margin: 0;">
                You can reply directly to this email to respond to ${name}.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Pixo. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        PIXO - New Contact Form Submission
        
        From: ${name} (${email})
        Subject: ${subject}
        
        Message:
        ${message}
        
        ---
        You can reply directly to this email to respond to ${name}.
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}

