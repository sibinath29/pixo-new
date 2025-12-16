import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// GET all products or filter by type
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // "poster" or "polaroid"

    // Explicitly type the query as `any` to satisfy Mongoose's `find` typings
    // while still allowing an optional `type` filter.
    const query: any = type ? { type } : {};
    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    
    // If it's a connection error, return empty array instead of error
    if (error.message?.includes("connection") || error.message?.includes("IP") || error.message?.includes("whitelist")) {
      console.warn("Database connection failed, returning empty products array");
      return NextResponse.json({ success: true, products: [] }, { status: 200 });
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products", products: [] },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      slug,
      title,
      category,
      type,
      price,
      sizes,
      description,
      tag,
      accent,
      image,
    } = body;

    // Validate required fields
    if (!slug || !title || !category || !type || !price || !sizes || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if product with same slug already exists
    // Cast query to `any` to satisfy Mongoose's strict TypeScript typings
    const existingProduct = await Product.findOne({ slug } as any);
    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product with this slug already exists" },
        { status: 400 }
      );
    }

    const product = new Product({
      slug,
      title,
      category,
      type,
      price: parseFloat(price),
      sizes,
      description,
      tag: tag || "",
      accent: accent || "#08f7fe",
      image: image || "",
    });

    await product.save();

    return NextResponse.json(
      { success: true, product },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

