"use client";

import { memo } from "react";
import type { Product } from "@/data/products";
import ProductCard from "./ProductCard";

type Props = {
  title?: string;
  subtitle?: string;
  products: Product[];
};

function ProductGrid({ title, subtitle, products }: Props) {
  return (
    <section className="space-y-4 sm:space-y-5 md:space-y-6">
      {(title || subtitle) && (
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {title && <h2 className="font-display text-xl sm:text-2xl md:text-3xl">{title}</h2>}
          {subtitle && <p className="text-sm sm:text-base text-white/60">{subtitle}</p>}
        </div>
      )}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        style={{ 
          contain: "layout style paint",
          willChange: "scroll-position"
        }}
      >
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

export default memo(ProductGrid);

