"use client";

import { useMemo, useState, useEffect } from "react";
import FilterBar from "@/components/FilterBar";
import ProductGrid from "@/components/ProductGrid";
import type { Product } from "@/data/products";

type Props = {
  initialPolaroids: Product[];
  filters: string[];
};

export default function PolaroidsClient({ initialPolaroids, filters }: Props) {
  const [active, setActive] = useState<string>("All");
  const [polaroids, setPolaroids] = useState<Product[]>(initialPolaroids);

  useEffect(() => {
    // Listen for product updates and refresh
    const handleUpdate = () => {
      fetch("/api/products?type=polaroid")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.products)) {
            setPolaroids(data.products);
          }
        })
        .catch(console.error);
    };
    
    window.addEventListener("productsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("productsUpdated", handleUpdate);
    };
  }, []);

  const filtered = useMemo(() => {
    if (active === "All") return polaroids;
    return polaroids.filter((item) => {
      if (Array.isArray(item.category)) {
        return item.category.includes(active);
      }
      return item.category === active;
    });
  }, [active, polaroids]);

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8">
      <div className="flex flex-col gap-2 sm:gap-3">
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-neon">Polaroids</p>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl">Pocket cyan snapshots</h1>
        <p className="text-sm sm:text-base text-white/60">Soft 2xl corners, neon outlines, slight hover scale and glow.</p>
      </div>

      <FilterBar filters={filters} active={active} onChange={setActive} />

      <ProductGrid title="Polaroid Set" products={filtered} />
    </div>
  );
}



