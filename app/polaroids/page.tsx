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

