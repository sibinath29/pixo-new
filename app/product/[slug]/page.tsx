import { getProductBySlugServer } from "@/lib/products-server";
import ProductDetailClient from "./product-client";

type Props = {
  params: { slug: string };
};

// Revalidate every 60 seconds to keep data fresh
export const revalidate = 60;

export default async function ProductDetail({ params }: Props) {
  // Fetch product on the server - this happens before the page is sent to the client
  const product = await getProductBySlugServer(params.slug);

  return <ProductDetailClient initialProduct={product} slug={params.slug} />;
}

