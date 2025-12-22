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

