import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getAuthUser } from "@/lib/auth";

// GET orders for logged-in user (by email)
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to view your orders." },
        { status: 401 }
      );
    }

    await connectDB();

    // Find orders by customer email (TS FIX → cast to any)
    const orders = await Order.find({ "customer.email": user.email } as any)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders: orders.map((order) => ({
        orderId: order.orderId,
        razorpayOrderId: order.razorpayOrderId,
        customer: order.customer,
        items: order.items,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
