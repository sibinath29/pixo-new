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

    // Return ACTUAL database values - no fallback logic
    const dbPriceA3 = (product as any).priceA3;
    const dbPriceA4 = (product as any).priceA4;
    
    console.log(`[GET /api/products/${params.slug}] Raw DB values:`, {
      priceA3: dbPriceA3,
      priceA4: dbPriceA4,
      priceA3Type: typeof dbPriceA3,
      priceA4Type: typeof dbPriceA4,
      priceA3IsNull: dbPriceA3 === null,
      priceA4IsNull: dbPriceA4 === null,
      priceA3IsUndefined: dbPriceA3 === undefined,
      priceA4IsUndefined: dbPriceA4 === undefined,
      priceA3IsNumber: typeof dbPriceA3 === 'number',
      priceA4IsNumber: typeof dbPriceA4 === 'number',
    });
    
    const typedProduct = {
      ...product,
      size: (product as any).size || undefined,
      salePrice: (product as any).salePrice != null ? Number((product as any).salePrice) : undefined,
      price: (product as any).price != null ? Number((product as any).price) : Number(dbPriceA4 || 0), // For backward compatibility only
      // CRITICAL: Convert to number if it exists and is valid, otherwise return null
      priceA3: (dbPriceA3 != null && dbPriceA3 !== undefined && !isNaN(Number(dbPriceA3))) ? Number(dbPriceA3) : null,
      priceA4: (dbPriceA4 != null && dbPriceA4 !== undefined && !isNaN(Number(dbPriceA4))) ? Number(dbPriceA4) : null,
      salePriceA3: (product as any).salePriceA3 != null ? Number((product as any).salePriceA3) : undefined,
      salePriceA4: (product as any).salePriceA4 != null ? Number((product as any).salePriceA4) : undefined,
    };
    
    console.log(`[GET /api/products/${params.slug}] Returning product with prices:`, {
      size: typedProduct.size,
      price: typedProduct.price,
      priceA3: typedProduct.priceA3,
      priceA4: typedProduct.priceA4,
      priceA3Type: typeof typedProduct.priceA3,
      priceA4Type: typeof typedProduct.priceA4,
      dbPriceA3,
      dbPriceA4,
    });

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
    if (!title || !category || !type || !size || !price || !sizes || !description) {
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

    // Parse and validate price
    const parsedPrice = typeof price === 'number' ? price : parseFloat(String(price));
    
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "Price must be a valid positive number" },
        { status: 400 }
      );
    }

    // Prepare update object
    const updateData: any = {
      $set: {
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
      }
    };
    
    // Keep priceA3 and priceA4 for backward compatibility if provided
    if (priceA3 !== undefined && priceA3 !== null && priceA3 !== "") {
      const parsedPriceA3 = typeof priceA3 === 'number' ? priceA3 : parseFloat(String(priceA3));
      if (!isNaN(parsedPriceA3) && parsedPriceA3 > 0) {
        updateData.$set.priceA3 = parsedPriceA3;
      }
    }
    
    if (priceA4 !== undefined && priceA4 !== null && priceA4 !== "") {
      const parsedPriceA4 = typeof priceA4 === 'number' ? priceA4 : parseFloat(String(priceA4));
      if (!isNaN(parsedPriceA4) && parsedPriceA4 > 0) {
        updateData.$set.priceA4 = parsedPriceA4;
      }
    }

    console.log(`[PUT /api/products/${params.slug}] Updating product:`, {
      size,
      price: updateData.$set.price,
      allKeys: Object.keys(updateData.$set),
    });

    // Handle salePrice: if provided and not empty/null, parse it; otherwise unset it to clear
    if (salePrice !== undefined && salePrice !== null && salePrice !== "") {
      const parsedSalePrice = typeof salePrice === 'number' ? salePrice : parseFloat(String(salePrice));
      if (!isNaN(parsedSalePrice) && parsedSalePrice > 0) {
        updateData.$set.salePrice = parsedSalePrice;
        console.log(`[PUT /api/products/${params.slug}] Setting salePrice to:`, parsedSalePrice);
      } else {
        // Use $unset to remove the field if invalid
        if (!updateData.$unset) updateData.$unset = {};
        updateData.$unset.salePrice = "";
        console.log(`[PUT /api/products/${params.slug}] Clearing salePrice (invalid value)`);
      }
    } else {
      // Use $unset to remove the field if empty
      if (!updateData.$unset) updateData.$unset = {};
      updateData.$unset.salePrice = "";
      console.log(`[PUT /api/products/${params.slug}] Clearing salePrice (empty/null)`);
    }

    // Handle salePriceA3
    if (salePriceA3 !== undefined && salePriceA3 !== null && salePriceA3 !== "") {
      const parsedSalePriceA3 = typeof salePriceA3 === 'number' ? salePriceA3 : parseFloat(String(salePriceA3));
      if (!isNaN(parsedSalePriceA3) && parsedSalePriceA3 > 0) {
        updateData.$set.salePriceA3 = parsedSalePriceA3;
      } else {
        if (!updateData.$unset) updateData.$unset = {};
        updateData.$unset.salePriceA3 = "";
      }
    } else {
      if (!updateData.$unset) updateData.$unset = {};
      updateData.$unset.salePriceA3 = "";
    }

    // Handle salePriceA4
    if (salePriceA4 !== undefined && salePriceA4 !== null && salePriceA4 !== "") {
      const parsedSalePriceA4 = typeof salePriceA4 === 'number' ? salePriceA4 : parseFloat(String(salePriceA4));
      if (!isNaN(parsedSalePriceA4) && parsedSalePriceA4 > 0) {
        updateData.$set.salePriceA4 = parsedSalePriceA4;
      } else {
        if (!updateData.$unset) updateData.$unset = {};
        updateData.$unset.salePriceA4 = "";
      }
    } else {
      if (!updateData.$unset) updateData.$unset = {};
      updateData.$unset.salePriceA4 = "";
    }

    // CRITICAL: Verify priceA3 and priceA4 are still in $set after all operations
    console.log(`[PUT /api/products/${params.slug}] Final update data before MongoDB:`, {
      priceA3InSet: updateData.$set.priceA3,
      priceA4InSet: updateData.$set.priceA4,
      priceA3Type: typeof updateData.$set.priceA3,
      priceA4Type: typeof updateData.$set.priceA4,
      hasPriceA3: 'priceA3' in updateData.$set,
      hasPriceA4: 'priceA4' in updateData.$set,
      allSetKeys: Object.keys(updateData.$set),
      fullUpdate: JSON.stringify(updateData, null, 2),
    });

    // Find and update product
    // CRITICAL: Build the final $set object ensuring priceA3 and priceA4 are explicitly included
    const finalSet: any = {
      title,
      category,
      type,
      price: Number(parsedPriceA4), // Set to A4 price for backward compatibility
      sizes,
      description,
      tag: tag || "",
      accent: accent || "#08f7fe",
      image: image || "",
      priceA3: Number(parsedPriceA3), // CRITICAL: Explicitly set as number
      priceA4: Number(parsedPriceA4), // CRITICAL: Explicitly set as number
    };

    // Add salePrice fields if they exist in updateData.$set
    if (updateData.$set.salePrice !== undefined) {
      finalSet.salePrice = updateData.$set.salePrice;
    }
    if (updateData.$set.salePriceA3 !== undefined) {
      finalSet.salePriceA3 = updateData.$set.salePriceA3;
    }
    if (updateData.$set.salePriceA4 !== undefined) {
      finalSet.salePriceA4 = updateData.$set.salePriceA4;
    }

    // Build the final update object
    const finalUpdate: any = {
      $set: finalSet,
    };

    // Add $unset if needed
    if (updateData.$unset && Object.keys(updateData.$unset).length > 0) {
      finalUpdate.$unset = updateData.$unset;
    }

    console.log(`[PUT /api/products/${params.slug}] Final update object:`, {
      priceA3: finalSet.priceA3,
      priceA4: finalSet.priceA4,
      priceA3Type: typeof finalSet.priceA3,
      priceA4Type: typeof finalSet.priceA4,
      allSetKeys: Object.keys(finalSet),
      fullUpdate: JSON.stringify(finalUpdate, null, 2),
    });

    // First, verify the product exists
    const existingProduct = await Product.findOne({ slug: params.slug } as any);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    
    console.log(`[PUT /api/products/${params.slug}] Product exists, current prices:`, {
      currentPriceA3: existingProduct.priceA3,
      currentPriceA4: existingProduct.priceA4,
    });

    // Perform the update using findOneAndUpdate to get the updated document directly
    let savedProduct;
    let updateResult;
    try {
      // Use findOneAndUpdate with new:true to get the updated document directly
      const updatedDoc = await Product.findOneAndUpdate(
        { slug: params.slug } as any,
        finalUpdate,
        { new: true, runValidators: false } // new: true returns the updated document
      );
      
      if (!updatedDoc) {
        return NextResponse.json(
          { success: false, error: "Product not found or update failed" },
          { status: 404 }
        );
      }

      savedProduct = updatedDoc.toObject ? updatedDoc.toObject() : updatedDoc;
      
      console.log(`[PUT /api/products/${params.slug}] findOneAndUpdate result:`, {
        found: !!savedProduct,
        priceA3: savedProduct?.priceA3,
        priceA4: savedProduct?.priceA4,
        priceA3Type: typeof savedProduct?.priceA3,
        priceA4Type: typeof savedProduct?.priceA4,
      });
      
    } catch (updateError: any) {
      console.error(`[PUT /api/products/${params.slug}] MongoDB update error:`, updateError);
      console.error(`[PUT /api/products/${params.slug}] Error details:`, {
        message: updateError.message,
        name: updateError.name,
        code: updateError.code,
        errors: updateError.errors,
        stack: updateError.stack,
      });
      return NextResponse.json(
        { success: false, error: `Failed to update product: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log(`[PUT /api/products/${params.slug}] Product saved to DB - verified:`, {
      slug: savedProduct?.slug,
      price: savedProduct?.price,
      priceA3: savedProduct?.priceA3,
      priceA4: savedProduct?.priceA4,
      priceA3Type: typeof savedProduct?.priceA3,
      priceA4Type: typeof savedProduct?.priceA4,
      priceA3IsNull: savedProduct?.priceA3 === null,
      priceA4IsNull: savedProduct?.priceA4 === null,
      priceA3IsUndefined: savedProduct?.priceA3 === undefined,
      priceA4IsUndefined: savedProduct?.priceA4 === undefined,
      priceA3Value: savedProduct?.priceA3,
      priceA4Value: savedProduct?.priceA4,
      allKeys: savedProduct ? Object.keys(savedProduct) : [],
      fullProduct: JSON.stringify(savedProduct, null, 2),
    });

    // CRITICAL: Ensure priceA3 and priceA4 are correctly extracted and converted
    // MongoDB/Mongoose may return these as numbers, but we need to handle all cases
    const dbPriceA3 = (savedProduct as any)?.priceA3;
    const dbPriceA4 = (savedProduct as any)?.priceA4;
    
    console.log(`[PUT /api/products/${params.slug}] Extracted DB prices:`, {
      dbPriceA3,
      dbPriceA4,
      dbPriceA3Type: typeof dbPriceA3,
      dbPriceA4Type: typeof dbPriceA4,
      dbPriceA3IsNumber: typeof dbPriceA3 === 'number',
      dbPriceA4IsNumber: typeof dbPriceA4 === 'number',
    });

    // Ensure all price fields are properly included in response from saved DB data
    const productResponse: any = {
      ...savedProduct,
      salePrice: savedProduct?.salePrice != null ? Number(savedProduct.salePrice) : undefined,
      price: savedProduct?.price != null ? Number(savedProduct.price) : Number(dbPriceA4 || 0),
      // CRITICAL: Convert to number if it exists, otherwise return null
      priceA3: (dbPriceA3 != null && dbPriceA3 !== undefined && !isNaN(Number(dbPriceA3))) ? Number(dbPriceA3) : null,
      priceA4: (dbPriceA4 != null && dbPriceA4 !== undefined && !isNaN(Number(dbPriceA4))) ? Number(dbPriceA4) : null,
    };

    console.log(`[PUT /api/products/${params.slug}] Returning updated product:`, {
      slug: productResponse.slug,
      price: productResponse.price,
      priceA3: productResponse.priceA3,
      priceA4: productResponse.priceA4,
      priceA3Type: typeof productResponse.priceA3,
      priceA4Type: typeof productResponse.priceA4,
      priceA3Raw: dbPriceA3,
      priceA4Raw: dbPriceA4,
    });

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

