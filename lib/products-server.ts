import connectDB from "@/lib/db";
import Product from "@/models/Product";
import type { Product as ProductType } from "@/data/products";

// Server-side product fetching functions
// These run on the server and return data directly from the database

export async function getProductsServer(): Promise<ProductType[]> {
  try {
    await connectDB();
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean()
      .select("-__v");
    
    // Ensure salePrice is included and properly typed
    const typedProducts = products.map((p: any) => ({
      ...p,
      salePrice: p.salePrice != null ? Number(p.salePrice) : undefined,
      price: Number(p.price),
    })) as ProductType[];
    
    return typedProducts;
  } catch (error) {
    console.error("Error fetching products on server:", error);
    return [];
  }
}

export async function getPostersServer(): Promise<ProductType[]> {
  const products = await getProductsServer();
  return products.filter((p) => p.type === "poster");
}

export async function getPolaroidsServer(): Promise<ProductType[]> {
  const products = await getProductsServer();
  return products.filter((p) => p.type === "polaroid");
}

export async function getProductBySlugServer(slug: string): Promise<ProductType | null> {
  try {
    await connectDB();
    const product = await Product.findOne({ slug } as any)
      .lean()
      .select("-__v");
    return product as ProductType | null;
  } catch (error) {
    console.error("Error fetching product by slug on server:", error);
    return null;
  }
}



