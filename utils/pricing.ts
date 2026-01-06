import type { Product } from "@/data/products";

/**
 * Get the price for a product based on size
 * @param product - The product object
 * @param size - The size (A3 or A4 - required)
 * @returns The price for the specified size
 */
export function getPriceForSize(product: Product, size?: string): number {
  // For A3 size
  if (size === "A3") {
    if (product.priceA3 != null && product.priceA3 > 0) {
      return product.priceA3;
    }
    // If priceA3 is not set, throw error - it should always be set
    console.error(`Product ${product.slug} missing priceA3! This should not happen.`);
    throw new Error(`Product ${product.slug} is missing A3 price`);
  }
  
  // For A4 size (default)
  if (size === "A4" || !size) {
    if (product.priceA4 != null && product.priceA4 > 0) {
      return product.priceA4;
    }
    // If priceA4 is not set, throw error - it should always be set
    console.error(`Product ${product.slug} missing priceA4! This should not happen.`);
    throw new Error(`Product ${product.slug} is missing A4 price`);
  }
  
  // Should never reach here, but return A4 as default
  return product.priceA4 || 0;
}

/**
 * Get the sale price for a product based on size
 * @param product - The product object
 * @param size - The size (A3, A4, or undefined for default)
 * @returns The sale price for the specified size, or default sale price, or undefined
 */
export function getSalePriceForSize(product: Product, size?: string): number | undefined {
  if (size === "A3" && product.salePriceA3 != null && product.salePriceA3 > 0) {
    return product.salePriceA3;
  }
  if (size === "A4" && product.salePriceA4 != null && product.salePriceA4 > 0) {
    return product.salePriceA4;
  }
  // Fallback to default sale price if size-specific sale price not set
  if (product.salePrice != null && product.salePrice > 0) {
    return product.salePrice;
  }
  return undefined;
}

/**
 * Get the effective price (sale price if available, otherwise regular price) for a product based on size
 * @param product - The product object
 * @param size - The size (A3, A4, or undefined for default)
 * @returns The effective price (sale price if available, otherwise regular price)
 */
export function getEffectivePriceForSize(product: Product, size?: string): number {
  const salePrice = getSalePriceForSize(product, size);
  if (salePrice !== undefined && salePrice > 0) {
    return salePrice;
  }
  return getPriceForSize(product, size);
}

