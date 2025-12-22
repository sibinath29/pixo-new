import PolaroidsClient from "./polaroids-client";
import { getPolaroidsServer } from "@/lib/products-server";

const filters = ["All", "Movies", "Sports", "Cars", "Anime", "Music", "More"];

// Revalidate every 60 seconds to keep data fresh
export const revalidate = 60;

export default async function PolaroidsPage() {
  // Fetch polaroids on the server - this happens before the page is sent to the client
  const polaroids = await getPolaroidsServer();

  return <PolaroidsClient initialPolaroids={polaroids} filters={filters} />;
}

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

