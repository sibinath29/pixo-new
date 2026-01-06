import connectDB from "@/lib/db";
import Product from "@/models/Product";
import type { Product as ProductType } from "@/data/products";

// Server-side product fetching functions
// These run on the server and return data directly from the database

export async function getProductsServer(): Promise<ProductType[]> {
  try {
    await connectDB();
    // By default, only fetch A4 products
    const products = await Product.find({ size: "A4" })
      .sort({ createdAt: -1 })
      .lean()
      .select("-__v");
    
    // Ensure all price fields are included and properly typed
    // Return ACTUAL database values - no fallback
    const typedProducts = products.map((p: any) => {
      return {
        ...p,
        size: p.size || undefined,
        salePrice: p.salePrice != null ? Number(p.salePrice) : undefined,
        price: p.price != null ? Number(p.price) : Number(p.priceA4 || 0), // For backward compatibility only
        priceA3: p.priceA3 != null ? Number(p.priceA3) : null, // Return actual value from DB
        priceA4: p.priceA4 != null ? Number(p.priceA4) : null, // Return actual value from DB
        salePriceA3: p.salePriceA3 != null ? Number(p.salePriceA3) : undefined,
        salePriceA4: p.salePriceA4 != null ? Number(p.salePriceA4) : undefined,
      } as ProductType;
    });
    
    return typedProducts;
  } catch (error) {
    console.error("Error fetching products on server:", error);
    return [];
  }
}

export async function getPostersServer(): Promise<ProductType[]> {
  const products = await getProductsServer();
  // Filter by type and show only A4 products by default
  return products.filter((p) => p.type === "poster" && (p.size === "A4" || !p.size));
}

export async function getPolaroidsServer(): Promise<ProductType[]> {
  const products = await getProductsServer();
  // Filter by type and show only A4 products by default
  return products.filter((p) => p.type === "polaroid" && (p.size === "A4" || !p.size));
}

export async function getProductBySlugServer(slug: string): Promise<ProductType | null> {
  try {
    await connectDB();
    const product = await Product.findOne({ slug } as any)
      .lean()
      .select("-__v");
    
    if (!product) {
      return null;
    }
    
    // Ensure all price fields are included and properly typed
    // Return ACTUAL database values - no fallback
    const dbPriceA3 = (product as any).priceA3;
    const dbPriceA4 = (product as any).priceA4;
    
    const typedProduct = {
      ...product,
      size: (product as any).size || undefined,
      salePrice: (product as any).salePrice != null ? Number((product as any).salePrice) : undefined,
      price: (product as any).price != null ? Number((product as any).price) : Number(dbPriceA4 || 0), // For backward compatibility only
      priceA3: dbPriceA3 != null ? Number(dbPriceA3) : null, // Return actual value from DB
      priceA4: dbPriceA4 != null ? Number(dbPriceA4) : null, // Return actual value from DB
      salePriceA3: (product as any).salePriceA3 != null ? Number((product as any).salePriceA3) : undefined,
      salePriceA4: (product as any).salePriceA4 != null ? Number((product as any).salePriceA4) : undefined,
    } as ProductType;
    
    return typedProduct;
  } catch (error) {
    console.error("Error fetching product by slug on server:", error);
    return null;
  }
}
