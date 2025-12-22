 "use client";

import Link from "next/link";
import { motion } from "framer-motion";
import PosterSlideshow from "./PosterSlideshow";
import type { Product } from "@/data/products";

type Props = {
  posters?: Product[];
};

export default function Hero({ posters = [] }: Props) {
  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-glass p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-neon blur-[120px]" />
        <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-cyan-neon/60 blur-[140px]" />
      </div>

      <div className="relative grid gap-6 sm:gap-8 md:gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <motion.p
            className="inline-flex items-center rounded-full border border-cyan-neon/50 bg-black/40 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-cyan-neon"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            Futuristic Prints
          </motion.p>
          <motion.h1
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-white"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            Pixo – Posters &amp; Polaroids
            <span className="text-cyan-neon"> That Speak</span>
          </motion.h1>
          <motion.p
            className="max-w-xl text-base sm:text-lg text-white/70"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Premium, minimal, and sharp. Cyan glow accents, glass edges, and soft corners built for
            modern spaces.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <Link href="/posters" className="cta-btn text-center text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3">
              Shop Posters
            </Link>
            <Link href="/polaroids" className="cta-btn border-white/20 text-white hover:text-black text-center text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3">
              Shop Polaroids
            </Link>
          </motion.div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-xs sm:text-sm text-white/60">
            <div>
              <p className="font-semibold text-white">Cyan Glow</p>
              <p>Neon outlines &amp; micro interactions.</p>
            </div>
            <div>
              <p className="font-semibold text-white">Premium Prints</p>
              <p>Soft 2xl rounded corners on all visuals.</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <PosterSlideshow initialPosters={posters} />
        </motion.div>
      </div>
    </section>
  );
}

