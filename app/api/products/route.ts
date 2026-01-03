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

    // Ensure salePrice is properly included and typed
    const typedProducts = products.map((p: any) => ({
      ...p,
      salePrice: p.salePrice != null ? Number(p.salePrice) : undefined,
      price: Number(p.price),
    }));

    // Add cache headers for client-side caching (reduced for faster updates)
    return NextResponse.json(
      { success: true, products: typedProducts },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
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
      salePrice,
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

    const productData: any = {
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
    };

    // Handle salePrice: only add if provided and valid
    if (salePrice !== undefined && salePrice !== null && salePrice !== "") {
      const parsedSalePrice = typeof salePrice === 'number' ? salePrice : parseFloat(String(salePrice));
      if (!isNaN(parsedSalePrice) && parsedSalePrice > 0) {
        productData.salePrice = parsedSalePrice;
        console.log(`[POST /api/products] Setting salePrice to:`, parsedSalePrice);
      }
    }

    console.log(`[POST /api/products] Product data:`, JSON.stringify(productData, null, 2));

    const product = new Product(productData);

    await product.save();
    
    console.log(`[POST /api/products] Saved product salePrice:`, product.salePrice);

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

