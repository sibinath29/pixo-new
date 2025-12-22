import nodemailer from "nodemailer";

// Create transporter - using Gmail as example (you can use any SMTP service)
let transporter: nodemailer.Transporter | null = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
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

// Alternative: Use SMTP directly (for other email providers)
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT || "587"),
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

export async function sendOTPEmail(email: string, code: string, isAdmin: boolean = false): Promise<boolean> {
  if (!transporter) {
    console.error("Email transporter not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env.local");
    return false;
  }

  try {
    const mailOptions = {
      from: `"Pixo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: isAdmin ? "Admin Login OTP - Pixo" : "Verify Your Email - Pixo",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #08f7fe; font-size: 32px; margin: 0;">PIXO</h1>
            <p style="color: #08f7fe; margin: 5px 0;">Posters & Polaroids</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(8, 247, 254, 0.3); border-radius: 12px; padding: 30px;">
            <h2 style="color: #08f7fe; margin-top: 0;">${isAdmin ? "Admin Login Verification" : "Email Verification"}</h2>
            <p style="color: #fff; line-height: 1.6;">
              ${isAdmin 
                ? "Someone is attempting to log in to the Pixo admin dashboard. If this is you, please enter the OTP code below to complete the login:"
                : "Thank you for signing up for Pixo! Please verify your email address by entering the code below:"}
            </p>
            
            <div style="background: rgba(8, 247, 254, 0.1); border: 2px solid #08f7fe; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #08f7fe; letter-spacing: 8px; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-bottom: 0;">
              This code will expire in 10 minutes. ${isAdmin ? "If you didn't attempt to log in, please ignore this email and consider changing your admin password." : "If you didn't request this code, please ignore this email."}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Pixo. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        PIXO - ${isAdmin ? "Admin Login OTP" : "Email Verification"}
        
        ${isAdmin 
          ? "Someone is attempting to log in to the Pixo admin dashboard. If this is you, please enter this OTP code:"
          : "Thank you for signing up! Please verify your email address by entering this code:"}
        
        ${code}
        
        This code will expire in 10 minutes.
        
        ${isAdmin ? "If you didn't attempt to log in, please ignore this email." : "If you didn't request this code, please ignore this email."}
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  orderData: {
    orderId: string;
    customerName: string;
    items: Array<{
      productTitle: string;
      quantity: number;
      price: number;
      size?: string;
    }>;
    totalAmount: number;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }
): Promise<boolean> {
  if (!transporter) {
    console.error("Email transporter not configured");
    return false;
  }

  try {
    const itemsHtml = orderData.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${item.productTitle}${item.size ? ` (${item.size})` : ""}</td>
        <td style="padding: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); text-align: right;">₹${item.price * item.quantity}</td>
      </tr>
    `
      )
      .join("");

    const mailOptions = {
      from: `"Pixo" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order Confirmation - ${orderData.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #08f7fe; font-size: 32px; margin: 0;">PIXO</h1>
            <p style="color: #08f7fe; margin: 5px 0;">Posters & Polaroids</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(8, 247, 254, 0.3); border-radius: 12px; padding: 30px;">
            <h2 style="color: #08f7fe; margin-top: 0;">Order Confirmed!</h2>
            <p style="color: #fff; line-height: 1.6;">
              Hi ${orderData.customerName},
            </p>
            <p style="color: #fff; line-height: 1.6;">
              Thank you for your purchase! Your order has been confirmed and we'll start processing it soon.
            </p>
            
            <div style="background: rgba(8, 247, 254, 0.1); border: 2px solid #08f7fe; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <p style="color: #08f7fe; font-weight: bold; margin: 0 0 10px 0;">Order ID: ${orderData.orderId}</p>
            </div>

            <h3 style="color: #08f7fe; margin-top: 30px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: rgba(8, 247, 254, 0.1);">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #08f7fe;">Item</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #08f7fe;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #08f7fe;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #08f7fe;">Total:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #08f7fe; border-top: 2px solid #08f7fe;">₹${(orderData.totalAmount / 100).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <h3 style="color: #08f7fe; margin-top: 30px;">Shipping Address</h3>
            <p style="color: #fff; line-height: 1.6;">
              ${orderData.address.line1}<br>
              ${orderData.address.line2 ? orderData.address.line2 + "<br>" : ""}
              ${orderData.address.city}, ${orderData.address.state} ${orderData.address.zipCode}<br>
              ${orderData.address.country}
            </p>

            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              We'll send you another email when your order ships. If you have any questions, please contact us.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Pixo. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        PIXO - Order Confirmation
        
        Hi ${orderData.customerName},
        
        Thank you for your purchase! Your order has been confirmed.
        
        Order ID: ${orderData.orderId}
        
        Order Details:
        ${orderData.items.map((item) => `${item.productTitle}${item.size ? ` (${item.size})` : ""} - Qty: ${item.quantity} - ₹${item.price * item.quantity}`).join("\n")}
        
        Total: ₹${(orderData.totalAmount / 100).toFixed(2)}
        
        Shipping Address:
        ${orderData.address.line1}
        ${orderData.address.line2 ? orderData.address.line2 + "\n" : ""}
        ${orderData.address.city}, ${orderData.address.state} ${orderData.address.zipCode}
        ${orderData.address.country}
        
        We'll send you another email when your order ships.
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
}

export async function sendAdminOrderNotification(
  adminEmail: string,
  orderData: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: Array<{
      productTitle: string;
      quantity: number;
      price: number;
      size?: string;
    }>;
    totalAmount: number;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }
): Promise<boolean> {
  if (!transporter) {
    console.error("Email transporter not configured");
    return false;
  }

  try {
    const itemsHtml = orderData.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${item.productTitle}${item.size ? ` (${item.size})` : ""}</td>
        <td style="padding: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); text-align: right;">₹${item.price * item.quantity}</td>
      </tr>
    `
      )
      .join("");

    const mailOptions = {
      from: `"Pixo" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Order Received - ${orderData.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #08f7fe; font-size: 32px; margin: 0;">PIXO</h1>
            <p style="color: #08f7fe; margin: 5px 0;">Posters & Polaroids</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(8, 247, 254, 0.3); border-radius: 12px; padding: 30px;">
            <h2 style="color: #08f7fe; margin-top: 0;">New Order Received!</h2>
            <p style="color: #fff; line-height: 1.6;">
              A new order has been placed on your Pixo store.
            </p>
            
            <div style="background: rgba(8, 247, 254, 0.1); border: 2px solid #08f7fe; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <p style="color: #08f7fe; font-weight: bold; margin: 0 0 10px 0;">Order ID: ${orderData.orderId}</p>
            </div>

            <h3 style="color: #08f7fe; margin-top: 30px;">Customer Information</h3>
            <p style="color: #fff; line-height: 1.6;">
              <strong>Name:</strong> ${orderData.customerName}<br>
              <strong>Email:</strong> ${orderData.customerEmail}<br>
              <strong>Phone:</strong> ${orderData.customerPhone}
            </p>

            <h3 style="color: #08f7fe; margin-top: 30px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: rgba(8, 247, 254, 0.1);">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #08f7fe;">Item</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #08f7fe;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #08f7fe;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #08f7fe;">Total:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #08f7fe; border-top: 2px solid #08f7fe;">₹${(orderData.totalAmount / 100).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <h3 style="color: #08f7fe; margin-top: 30px;">Shipping Address</h3>
            <p style="color: #fff; line-height: 1.6;">
              ${orderData.address.line1}<br>
              ${orderData.address.line2 ? orderData.address.line2 + "<br>" : ""}
              ${orderData.address.city}, ${orderData.address.state} ${orderData.address.zipCode}<br>
              ${orderData.address.country}
            </p>

            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Please process this order and update the status in the admin dashboard.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Pixo. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        PIXO - New Order Notification
        
        A new order has been placed on your Pixo store.
        
        Order ID: ${orderData.orderId}
        
        Customer Information:
        Name: ${orderData.customerName}
        Email: ${orderData.customerEmail}
        Phone: ${orderData.customerPhone}
        
        Order Details:
        ${orderData.items.map((item) => `${item.productTitle}${item.size ? ` (${item.size})` : ""} - Qty: ${item.quantity} - ₹${item.price * item.quantity}`).join("\n")}
        
        Total: ₹${(orderData.totalAmount / 100).toFixed(2)}
        
        Shipping Address:
        ${orderData.address.line1}
        ${orderData.address.line2 ? orderData.address.line2 + "\n" : ""}
        ${orderData.address.city}, ${orderData.address.state} ${orderData.address.zipCode}
        ${orderData.address.country}
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending admin order notification:", error);
    return false;
  }
}

export async function sendContactEmail(
  adminEmail: string,
  contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }
): Promise<boolean> {
  if (!transporter) {
    console.error("Email transporter not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env.local");
    return false;
  }

  try {
    // Escape HTML to prevent XSS
    const escapeHtml = (text: string) => {
      const map: { [key: string]: string } = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    };

    const mailOptions = {
      from: `"Pixo Contact Form" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      replyTo: contactData.email,
      subject: `Contact Form: ${contactData.subject}`,
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
              <p style="color: #fff; margin: 0;">${escapeHtml(contactData.name)} (${escapeHtml(contactData.email)})</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="color: #08f7fe; font-weight: bold; margin-bottom: 5px;">Subject:</p>
              <p style="color: #fff; margin: 0;">${escapeHtml(contactData.subject)}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="color: #08f7fe; font-weight: bold; margin-bottom: 5px;">Message:</p>
              <p style="color: #fff; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(contactData.message)}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="color: #999; font-size: 14px; margin: 0;">
                You can reply directly to this email to respond to ${escapeHtml(contactData.name)}.
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
        
        From: ${contactData.name} (${contactData.email})
        Subject: ${contactData.subject}
        
        Message:
        ${contactData.message}
        
        ---
        You can reply directly to this email to respond to ${contactData.name}.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Contact email sent successfully to ${adminEmail} from ${contactData.email}`);
    return true;
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack,
    });
    return false;
  }
}

export async function verifyEmailConfig(): Promise<boolean> {
  if (!transporter) {
    return false;
  }
  
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
}

