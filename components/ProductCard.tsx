 "use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import type { Product } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" } // Start loading 50px before entering viewport
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -6, boxShadow: "0 10px 40px rgba(8, 247, 254, 0.25)" }}
      transition={{ duration: 0.28 }}
      className="h-full"
      style={{ 
        willChange: isVisible ? "transform" : "auto",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)"
      }}
    >
      <Link
        href={`/product/${product.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-black/40 hover:border-cyan-neon/50 transition-all duration-300"
        style={{ 
          contain: "layout style paint",
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)"
        }}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-xl sm:rounded-t-2xl bg-ink flex items-center justify-center">
          {product.image && isVisible ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/80 animate-pulse" />
              )}
              <img
                src={product.image}
                alt={product.title}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-contain rounded-t-xl sm:rounded-t-2xl transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                style={{ willChange: "opacity" }}
              />
            </>
          ) : product.image ? (
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/80 animate-pulse" />
          ) : (
            <div
              className="absolute inset-0 rounded-t-xl sm:rounded-t-2xl"
              style={{
                background: `linear-gradient(135deg, ${product.accent || "#08f7fe"}, #00141a 70%)`,
              }}
            />
          )}
          <div className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2 rounded-full border border-cyan-neon px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-cyan-neon bg-black/50 backdrop-blur-sm">
            {product.tag || (Array.isArray(product.category) ? product.category[0] : product.category)}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 sm:gap-2 p-2 sm:p-3">
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="font-display text-sm sm:text-base text-white line-clamp-1">{product.title}</h3>
            <div className="flex flex-col items-end flex-shrink-0">
              {product.salePrice && product.salePrice > 0 ? (
                <>
                  <span className="text-cyan-neon font-semibold text-xs sm:text-sm">₹{product.salePrice}</span>
                  <span className="text-white/50 font-semibold text-[10px] sm:text-xs line-through">₹{product.price}</span>
                </>
              ) : (
                <span className="text-cyan-neon font-semibold text-xs sm:text-sm">₹{product.price}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(product.category) ? (
              product.category.map((cat, idx) => (
                <span key={idx} className="text-[10px] sm:text-xs text-white/60">
                  {cat}{idx < product.category.length - 1 ? "," : ""}
                </span>
              ))
            ) : (
              <p className="text-[10px] sm:text-xs text-white/60">{product.category}</p>
            )}
          </div>
          <div className="mt-auto flex items-center gap-1 text-[9px] sm:text-[10px] text-white/50">
            <span className="rounded-full border border-white/10 px-1 sm:px-1.5 py-0.5">{product.type}</span>
            <span className="rounded-full border border-white/10 px-1 sm:px-1.5 py-0.5">{product.sizes[0]}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

