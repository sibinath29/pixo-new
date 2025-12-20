"use client";

import type { Product } from "@/data/products";

// Cache for products to avoid repeated API calls
let productsCache: Product[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 second cache (increased from 5s)

async function getCachedProducts(): Promise<Product[]> {
  const now = Date.now();
  if (productsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return productsCache;
  }
  
  try {
    // Use Next.js fetch with caching enabled
    const response = await fetch("/api/products", {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    
    if (!response.ok) {
      // If cache exists, return it even if request failed
      if (productsCache) {
        console.warn("API request failed, returning cached data");
        return productsCache;
      }
      console.warn("API request failed, returning empty array");
      return [];
    }
    
    const data = await response.json();
    productsCache = Array.isArray(data.products) ? data.products : [];
    cacheTimestamp = now;
    return productsCache;
  } catch (error) {
    console.error("Error loading products:", error);
    // Return cached data if available, otherwise empty array
    return productsCache || [];
  }
}

// Invalidate cache when products are updated
if (typeof window !== "undefined") {
  window.addEventListener("productsUpdated", () => {
    productsCache = null;
  });
}

export async function getPosters(): Promise<Product[]> {
  if (typeof window === "undefined") return [];
  const products = await getCachedProducts();
  return products.filter((p) => p.type === "poster");
}

export async function getPolaroids(): Promise<Product[]> {
  if (typeof window === "undefined") return [];
  const products = await getCachedProducts();
  return products.filter((p) => p.type === "polaroid");
}

export async function getAllProducts(): Promise<Product[]> {
  if (typeof window === "undefined") return [];
  return await getCachedProducts();
}

export async function findProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    // Try fetching directly from API for single product
    const response = await fetch(`/api/products/${slug}`);
    if (response.ok) {
      const data = await response.json();
      return data.product;
    }
  } catch (error) {
    console.error("Error fetching product by slug:", error);
  }
  
  // Fallback to searching in cached products
  const products = await getAllProducts();
  return products.find((item) => item.slug === slug);
}

