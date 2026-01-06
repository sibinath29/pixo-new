export type Product = {
  slug: string;
  title: string;
  category: string | string[]; // Support both single and multiple categories for backward compatibility
  type: "poster" | "polaroid";
  size?: "A3" | "A4"; // Product size (A3 or A4)
  price: number;
  salePrice?: number; // Optional sale price
  priceA3?: number; // Price for A3 size (deprecated - kept for backward compatibility)
  priceA4?: number; // Price for A4 size (deprecated - kept for backward compatibility)
  salePriceA3?: number; // Optional sale price for A3 (deprecated)
  salePriceA4?: number; // Optional sale price for A4 (deprecated)
  sizes: string[];
  description: string;
  tag?: string;
  accent?: string;
  image?: string; // Base64 image data or URL
};

// Empty arrays - all products are now managed through admin dashboard
export const posters: Product[] = [];
export const polaroids: Product[] = [];
export const featured: Product[] = [];
export const allProducts: Product[] = [];

export function findProductBySlug(slug: string) {
  return allProducts.find((item) => item.slug === slug);
}

