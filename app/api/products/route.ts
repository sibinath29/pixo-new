import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// GET all products or filter by type
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // "poster" or "polaroid"
    const size = searchParams.get("size"); // "A3" or "A4" - if not specified, default to A4

    const query: any = type ? { type } : {};
    // By default, only show A4 products unless size is explicitly requested
    if (!size) {
      query.size = "A4";
    } else if (size === "A3" || size === "A4") {
      query.size = size;
    } else {
      // If invalid size, default to A4
      query.size = "A4";
    }
    
    // Use lean() for faster queries - returns plain JavaScript objects instead of Mongoose documents
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .select("-__v"); // Exclude version key for smaller response

    // Ensure all price fields are properly included and typed
    // Return ACTUAL database values - no fallback
    const typedProducts = products.map((p: any) => {
      return {
        ...p,
        size: p.size || undefined,
        salePrice: p.salePrice != null ? Number(p.salePrice) : undefined,
        price: p.price != null ? Number(p.price) : Number(p.priceA4 || 0), // For backward compatibility only
        priceA3: p.priceA3 != null ? Number(p.priceA3) : null, // Return actual value or null
        priceA4: p.priceA4 != null ? Number(p.priceA4) : null, // Return actual value or null
        salePriceA3: p.salePriceA3 != null ? Number(p.salePriceA3) : undefined,
        salePriceA4: p.salePriceA4 != null ? Number(p.salePriceA4) : undefined,
      };
    });

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
      size,
      price,
      salePrice,
      priceA3,
      priceA4,
      salePriceA3,
      salePriceA4,
      sizes,
      description,
      tag,
      accent,
      image,
    } = body;

    // Validate required fields - size and price are now required
    if (!slug || !title || !category || !type || !size || !price || !sizes || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields. Size and price are required." },
        { status: 400 }
      );
    }

    // Validate size is A3 or A4
    if (size !== "A3" && size !== "A4") {
      return NextResponse.json(
        { success: false, error: "Size must be either A3 or A4" },
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

    // Parse and validate price
    const parsedPrice = typeof price === 'number' ? price : parseFloat(String(price));
    
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "Price must be a valid positive number" },
        { status: 400 }
      );
    }

    const productData: any = {
      slug,
      title,
      category,
      type,
      size,
      price: parsedPrice,
      sizes,
      description,
      tag: tag || "",
      accent: accent || "#08f7fe",
      image: image || "",
    };
    
    // Keep priceA3 and priceA4 for backward compatibility if provided
    if (priceA3 !== undefined && priceA3 !== null) {
      const parsedPriceA3 = typeof priceA3 === 'number' ? priceA3 : parseFloat(String(priceA3));
      if (!isNaN(parsedPriceA3) && parsedPriceA3 > 0) {
        productData.priceA3 = parsedPriceA3;
      }
    }
    
    if (priceA4 !== undefined && priceA4 !== null) {
      const parsedPriceA4 = typeof priceA4 === 'number' ? priceA4 : parseFloat(String(priceA4));
      if (!isNaN(parsedPriceA4) && parsedPriceA4 > 0) {
        productData.priceA4 = parsedPriceA4;
      }
    }

    // Handle salePrice: only add if provided and valid
    if (salePrice !== undefined && salePrice !== null && salePrice !== "") {
      const parsedSalePrice = typeof salePrice === 'number' ? salePrice : parseFloat(String(salePrice));
      if (!isNaN(parsedSalePrice) && parsedSalePrice > 0) {
        productData.salePrice = parsedSalePrice;
        console.log(`[POST /api/products] Setting salePrice to:`, parsedSalePrice);
      }
    }

    // Handle salePriceA3: only add if provided and valid
    if (salePriceA3 !== undefined && salePriceA3 !== null && salePriceA3 !== "") {
      const parsedSalePriceA3 = typeof salePriceA3 === 'number' ? salePriceA3 : parseFloat(String(salePriceA3));
      if (!isNaN(parsedSalePriceA3) && parsedSalePriceA3 > 0) {
        productData.salePriceA3 = parsedSalePriceA3;
      }
    }

    // Handle salePriceA4: only add if provided and valid
    if (salePriceA4 !== undefined && salePriceA4 !== null && salePriceA4 !== "") {
      const parsedSalePriceA4 = typeof salePriceA4 === 'number' ? salePriceA4 : parseFloat(String(salePriceA4));
      if (!isNaN(parsedSalePriceA4) && parsedSalePriceA4 > 0) {
        productData.salePriceA4 = parsedSalePriceA4;
      }
    }

    console.log(`[POST /api/products] Product data being saved:`, {
      slug,
      size,
      price: productData.price,
    });

    const product = new Product(productData);

    await product.save();
    
    // Verify what was actually saved by fetching from DB
    const savedProduct = await Product.findOne({ slug } as any).lean();
    console.log(`[POST /api/products] Product saved to DB - verified:`, {
      slug: savedProduct?.slug,
      price: savedProduct?.price,
      priceA3: savedProduct?.priceA3,
      priceA4: savedProduct?.priceA4,
    });

    // Return the saved product with all price fields from DB
    const responseProduct = {
      ...savedProduct,
      price: Number(savedProduct?.price),
      size: savedProduct?.size,
      priceA3: savedProduct?.priceA3 != null ? Number(savedProduct.priceA3) : null,
      priceA4: savedProduct?.priceA4 != null ? Number(savedProduct.priceA4) : null,
    };
    
    console.log(`[POST /api/products] Returning product:`, {
      slug: responseProduct.slug,
      size: responseProduct.size,
      price: responseProduct.price,
    });
    
    return NextResponse.json(
      { success: true, product: responseProduct },
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

