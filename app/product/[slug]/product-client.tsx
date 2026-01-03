"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/data/products";

type Props = {
  initialProduct: Product | null;
  slug: string;
};

export default function ProductDetailClient({ initialProduct, slug }: Props) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const { addToCart } = useCart();
  const availableSizes = ["A3", "A4"];
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    // Listen for product updates and refresh
    const handleUpdate = () => {
      fetch(`/api/products/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.product) {
            setProduct(data.product);
          }
        })
        .catch(console.error);
    };
    
    window.addEventListener("productsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("productsUpdated", handleUpdate);
    };
  }, [slug]);

  if (!product) return notFound();

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid gap-6 sm:gap-8 md:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:rounded-3xl flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain rounded-2xl sm:rounded-3xl"
            />
          ) : (
            <div
              className="relative w-full h-full"
              style={{
                background: `linear-gradient(145deg, ${product.accent || "#08f7fe"}, #001015 60%)`,
              }}
            >
              <div className="absolute inset-2 sm:inset-4 rounded-2xl sm:rounded-3xl border border-white/10" />
              <div className="absolute right-3 bottom-3 sm:right-6 sm:bottom-6 h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-cyan-neon/60 blur-[80px]" />
            </div>
          )}
          <div className="absolute left-2 top-2 sm:left-4 sm:top-4 rounded-full border border-cyan-neon px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-semibold text-cyan-neon bg-black/50 backdrop-blur-sm">
            {Array.isArray(product.category) ? product.category[0] : product.category}
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-neon">{product.type}</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl">{product.title}</h1>
          <p className="text-sm sm:text-base text-white/70">{product.description}</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div>
            <p className="text-xs sm:text-sm text-white/60">Starting at</p>
            {product.salePrice && product.salePrice > 0 ? (
              <div className="flex items-center gap-3">
                <p className="text-2xl sm:text-3xl font-display text-cyan-neon">₹{product.salePrice}</p>
                <p className="text-xl sm:text-2xl font-display text-white/50 line-through">₹{product.price}</p>
              </div>
            ) : (
              <p className="text-2xl sm:text-3xl font-display text-cyan-neon">₹{product.price}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-white/60">
            {Array.isArray(product.category) ? (
              product.category.map((cat, idx) => (
                <span key={idx} className="rounded-full border border-white/10 px-2 sm:px-3 py-1">
                  {cat}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-white/10 px-2 sm:px-3 py-1">{product.category}</span>
            )}
            <span className="rounded-full border border-white/10 px-2 sm:px-3 py-1 capitalize">{product.type}</span>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <p className="text-xs sm:text-sm text-white/70">Size options</p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`rounded-full border px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all ${
                  selectedSize === size
                    ? "border-cyan-neon bg-cyan-neon text-black shadow-neon"
                    : "border-cyan-neon/60 text-cyan-neon hover:border-cyan-neon hover:bg-cyan-neon/10"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleAddToCart}
            className={`cta-btn flex-1 text-center text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3 transition-all ${
              added ? "bg-cyan-neon text-black" : ""
            }`}
          >
            {added ? "Added to Cart!" : "Add to Cart"}
          </button>
          <Link
            href={product.type === "poster" ? "/posters" : "/polaroids"}
            className="rounded-full border border-white/20 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:border-cyan-neon hover:text-cyan-neon text-center"
          >
            Back
          </Link>
        </div>

        <div className="space-y-2 sm:space-y-3 rounded-2xl border border-white/10 bg-black/50 p-4 sm:p-5">
          <p className="text-xs sm:text-sm font-semibold text-white">Details</p>
          <ul className="list-disc space-y-1 pl-4 sm:pl-5 text-xs sm:text-sm text-white/65">
            <li>Soft 2xl rounded corners on every print.</li>
            <li>Cyan neon outlines with glassmorphism accents.</li>
            <li>Printed on premium matte stock ready for framing.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}



