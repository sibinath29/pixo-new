import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// GET single product by slug
// Cache for 60 seconds
export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const product = await Product.findOne({ slug: params.slug } as any)
      .lean()
      .select("-__v");

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Ensure salePrice is properly included and typed
    const typedProduct = {
      ...product,
      salePrice: (product as any).salePrice != null ? Number((product as any).salePrice) : undefined,
      price: Number((product as any).price),
    };

    return NextResponse.json(
      { success: true, product: typedProduct },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT/PATCH - Update product by slug
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const {
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
    if (!title || !category || !type || !price || !sizes || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare base update object
    const baseUpdate: any = {
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

    // Handle salePrice: if provided and not empty/null, parse it; otherwise unset it to clear
    const updateData: any = { $set: baseUpdate };
    
    if (salePrice !== undefined && salePrice !== null && salePrice !== "") {
      const parsedSalePrice = typeof salePrice === 'number' ? salePrice : parseFloat(String(salePrice));
      if (!isNaN(parsedSalePrice) && parsedSalePrice > 0) {
        updateData.$set.salePrice = parsedSalePrice;
        console.log(`[PUT /api/products/${params.slug}] Setting salePrice to:`, parsedSalePrice);
      } else {
        // Use $unset to remove the field if invalid
        updateData.$unset = { salePrice: "" };
        delete updateData.$set.salePrice; // Remove from $set if we're unsetting
        console.log(`[PUT /api/products/${params.slug}] Clearing salePrice (invalid value)`);
      }
    } else {
      // Use $unset to remove the field if empty
      updateData.$unset = { salePrice: "" };
      delete updateData.$set.salePrice; // Remove from $set if we're unsetting
      console.log(`[PUT /api/products/${params.slug}] Clearing salePrice (empty/null)`);
    }

    console.log(`[PUT /api/products/${params.slug}] Update data:`, JSON.stringify(updateData, null, 2));
    console.log(`[PUT /api/products/${params.slug}] Received salePrice:`, salePrice, typeof salePrice);

    // Find and update product
    const product = await Product.findOneAndUpdate(
      { slug: params.slug } as any,
      updateData,
      { new: true, runValidators: true }
    );

    if (product) {
      const savedProduct = await Product.findOne({ slug: params.slug } as any).lean();
      console.log(`[PUT /api/products/${params.slug}] Saved product salePrice from DB:`, savedProduct?.salePrice);
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Ensure salePrice is properly included in response
    const productResponse = product.toObject ? product.toObject() : product;
    if (productResponse) {
      productResponse.salePrice = productResponse.salePrice != null ? Number(productResponse.salePrice) : undefined;
      productResponse.price = Number(productResponse.price);
    }

    return NextResponse.json(
      { success: true, product: productResponse },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product by slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const product = await Product.findOneAndDelete({ slug: params.slug }as any);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // TODO: Delete associated image file if exists
    // if (product.image) {
    //   const imagePath = path.join(process.cwd(), "public", product.image);
    //   if (fs.existsSync(imagePath)) {
    //     fs.unlinkSync(imagePath);
    //   }
    // }

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}

