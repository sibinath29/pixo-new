import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { error: "Missing payment verification data" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find order in database
    const order = await Order.findOne({ orderId }as any);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // Update order status to failed
      order.status = "failed";
      await order.save();

      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Payment verified successfully
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.status = "paid";
    await order.save();

    // Send email notifications
    try {
      // Send confirmation email to customer
      await sendOrderConfirmationEmail(order.customer.email, {
        orderId: order.orderId,
        customerName: order.customer.name,
        items: order.items.map((item) => ({
          productTitle: item.productTitle,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
        totalAmount: order.amount,
        address: order.customer.address,
      });

      // Send notification email to admin
      await sendAdminOrderNotification("pixo.shopoff@gmail.com", {
        orderId: order.orderId,
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone,
        items: order.items.map((item) => ({
          productTitle: item.productTitle,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
        totalAmount: order.amount,
        address: order.customer.address,
      });
    } catch (emailError) {
      console.error("Error sending order emails:", emailError);
      // Don't fail the payment verification if emails fail
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        orderId: order.orderId,
        status: order.status,
      },
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

