"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { Product } from "@/data/products";
import Link from "next/link";

type Props = {
  initialPosters?: Product[];
};

export default function PosterSlideshow({ initialPosters = [] }: Props) {
  const [posters, setPosters] = useState<Product[]>(initialPosters);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Listen for product updates and refresh
    const handleUpdate = () => {
      fetch("/api/products?type=poster")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.products)) {
            setPosters(data.products);
          }
        })
        .catch(console.error);
    };
    
    window.addEventListener("productsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("productsUpdated", handleUpdate);
    };
  }, []);

  // Get first 3 posters for the slideshow
  const slides = posters.slice(0, 3);

  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const currentPoster = slides[currentIndex];

  // Don't render if no posters available
  if (!currentPoster || slides.length === 0) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-ink to-black flex flex-col items-center justify-center gap-3 p-6">
        <p className="text-white/60 text-sm">No posters available</p>
        <p className="text-white/40 text-xs text-center max-w-xs">
          {posters.length === 0 
            ? "Add posters in the admin dashboard to see them here"
            : "Loading posters..."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-ink to-black">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute right-6 bottom-6 h-32 w-32 rounded-full border border-cyan-neon/50 blur-[60px]" />
      </div>

      {/* Slideshow container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8"
        >
          <Link
            href={`/product/${currentPoster.slug}`}
            className="group relative h-full w-full rounded-xl sm:rounded-2xl overflow-hidden"
          >
            {/* Poster image or placeholder with gradient */}
            {currentPoster.image ? (
              <img
                src={currentPoster.image}
                alt={currentPoster.title}
                className="h-full w-full rounded-xl sm:rounded-2xl border-2 border-cyan-neon/40 shadow-neon transition-all duration-500 group-hover:border-cyan-neon group-hover:shadow-[0_0_30px_rgba(8,247,254,0.5)] object-contain"
              />
            ) : (
              <div
                className="h-full w-full rounded-xl sm:rounded-2xl border-2 border-cyan-neon/40 shadow-neon transition-all duration-500 group-hover:border-cyan-neon group-hover:shadow-[0_0_30px_rgba(8,247,254,0.5)]"
                style={{
                  background: `linear-gradient(135deg, ${currentPoster.accent || "#08f7fe"}15 0%, black 50%, ${currentPoster.accent || "#08f7fe"}10 100%)`,
                }}
              >
                {/* Inner glow effect */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-transparent via-cyan-neon/5 to-transparent" />
              </div>
            )}
            
            {/* Poster content overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 text-center bg-black/20 rounded-xl sm:rounded-2xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2 sm:space-y-3"
              >
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-cyan-neon/80">
                  {currentPoster.tag}
                </p>
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl text-white">
                  {currentPoster.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/60 max-w-xs">
                  {currentPoster.description}
                </p>
                <div className="pt-1 sm:pt-2">
                  <span className="text-base sm:text-lg font-bold text-cyan-neon">
                    ₹{currentPoster.price}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Decorative corner elements */}
            <div className="absolute top-3 left-3 h-2 w-2 rounded-full bg-cyan-neon/60" />
            <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-cyan-neon/60" />
            <div className="absolute bottom-3 left-3 h-2 w-2 rounded-full bg-cyan-neon/60" />
            <div className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-cyan-neon/60" />
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-6 sm:w-8 bg-cyan-neon shadow-neon"
                : "w-1 sm:w-1.5 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrows (optional, hidden on mobile) */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 rounded-full border border-cyan-neon/40 bg-black/60 text-cyan-neon transition-all hover:border-cyan-neon hover:bg-black/80 hover:shadow-neon"
        aria-label="Previous slide"
      >
        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
        className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 rounded-full border border-cyan-neon/40 bg-black/60 text-cyan-neon transition-all hover:border-cyan-neon hover:bg-black/80 hover:shadow-neon"
        aria-label="Next slide"
      >
        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

