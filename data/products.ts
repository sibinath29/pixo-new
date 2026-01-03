export type Product = {
  slug: string;
  title: string;
  category: string | string[]; // Support both single and multiple categories for backward compatibility
  type: "poster" | "polaroid";
  price: number;
  salePrice?: number; // Optional sale price
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

