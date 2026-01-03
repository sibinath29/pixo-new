import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

// Generate unique order ID
function generateOrderId(): string {
  return `PIXO_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  try {
    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment variables." },
        { status: 500 }
      );
    }

    // Initialize Razorpay inside the function to avoid module-level errors
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const body = await req.json();
    const { customer, items, amount } = body;

    // Validation
    if (!customer || !items || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!customer.name || !customer.email || !customer.phone || !customer.address) {
      return NextResponse.json(
        { error: "Missing customer information" },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Validate amount (should be in paise, minimum ₹1 = 100 paise)
    const amountInPaise = Math.round(amount * 100);
    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: "Minimum order amount is ₹1" },
        { status: 400 }
      );
    }

    // Connect to database
    try {
      await connectDB();
    } catch (dbError: any) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed. Please check your MongoDB connection." },
        { status: 500 }
      );
    }

    // Create Razorpay order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: generateOrderId(),
        notes: {
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
        },
      });
    } catch (razorpayError: any) {
      console.error("Razorpay order creation error:", razorpayError);
      console.error("Error details:", {
        message: razorpayError.message,
        description: razorpayError.description,
        error: razorpayError.error,
        statusCode: razorpayError.statusCode,
      });
      
      // Provide more detailed error message
      let errorMessage = "Failed to create Razorpay order.";
      if (razorpayError.error?.description) {
        errorMessage = razorpayError.error.description;
      } else if (razorpayError.description) {
        errorMessage = razorpayError.description;
      } else if (razorpayError.message) {
        errorMessage = razorpayError.message;
      } else {
        errorMessage = "Failed to create Razorpay order. Please check your Razorpay keys are correct and valid.";
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Create order in database
    try {
      const orderId = generateOrderId();
      const order = new Order({
        orderId,
        razorpayOrderId: razorpayOrder.id,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: {
            line1: customer.address.line1,
            line2: customer.address.line2 || "",
            city: customer.address.city,
            state: customer.address.state,
            zipCode: customer.address.zipCode,
            country: customer.address.country || "India",
          },
        },
        items: items.map((item: any) => ({
          productSlug: item.product.slug,
          productTitle: item.product.title,
          productType: item.product.type,
          size: item.size || "",
          quantity: item.quantity,
          price: item.product.salePrice || item.product.price, // Use salePrice if available
        })),
        amount: amountInPaise,
        currency: "INR",
        status: "pending",
      });

      await order.save();

      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY_ID,
        },
      });
    } catch (dbError: any) {
      console.error("Database save error:", dbError);
      return NextResponse.json(
        { error: "Failed to save order to database. Please try again." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

