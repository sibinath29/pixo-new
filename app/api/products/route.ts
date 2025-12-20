import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// GET all products or filter by type
// Cache for 60 seconds (ISR - Incremental Static Regeneration)
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // "poster" or "polaroid"

    const query: any = type ? { type } : {};
    // Use lean() for faster queries - returns plain JavaScript objects instead of Mongoose documents
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .select("-__v"); // Exclude version key for smaller response

    // Add cache headers for client-side caching
    return NextResponse.json(
      { success: true, products },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
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
    const existingProduct = await Product.findOne({ slug });
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

