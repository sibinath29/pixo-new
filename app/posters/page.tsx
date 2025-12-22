import PostersClient from "./posters-client";
import { getPostersServer } from "@/lib/products-server";

const filters = ["All", "Movies", "Sports", "Cars", "Anime", "Music", "More"];

// Revalidate every 60 seconds to keep data fresh
export const revalidate = 60;

export default async function PostersPage() {
  // Fetch posters on the server - this happens before the page is sent to the client
  const posters = await getPostersServer();

  return <PostersClient initialPosters={posters} filters={filters} />;
}

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8">
      <div className="flex flex-col gap-2 sm:gap-3">
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-neon">Posters</p>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl">Cyan-forward poster grid</h1>
        <p className="text-sm sm:text-base text-white/60">Hover for glow. Sharp, minimal edges. All corners softened.</p>
      </div>

      <FilterBar filters={filters} active={active} onChange={setActive} />

      <ProductGrid title="Collection" products={filtered} />
    </div>
  );
}

