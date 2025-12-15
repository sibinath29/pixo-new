"use client";

import type { Product } from "@/data/products";

// Cache for products to avoid repeated API calls
let productsCache: Product[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 second cache

async function getCachedProducts(): Promise<Product[]> {
  const now = Date.now();
  if (productsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return productsCache;
  }
  
  try {
    const response = await fetch("/api/products", { cache: "no-store" });
    if (!response.ok) {
      console.warn("API request failed, returning empty array");
      return [];
    }
    const data = await response.json();
    productsCache = Array.isArray(data.products) ? data.products : [];
    cacheTimestamp = now;
    return productsCache;
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
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

