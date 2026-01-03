"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import Link from "next/link";
import type { Product } from "@/data/products";

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posters" | "polaroids">("posters");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products", {
        cache: "no-store", // Always fetch fresh data in admin
      });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    // Load products once on mount
    loadProducts();

    // Listen for focus events (when navigating back to this page)
    const handleFocus = () => {
      loadProducts();
    };
    
    // Listen for product update events
    const handleProductsUpdated = () => {
      loadProducts();
    };
    
    window.addEventListener("focus", handleFocus);
    window.addEventListener("productsUpdated", handleProductsUpdated);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("productsUpdated", handleProductsUpdated);
    };
  }, [isAuthenticated, router]);

  const deleteProduct = async (slug: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${slug}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete product");
        }
        
        // Reload products after deletion
        await loadProducts();
      } catch (error: any) {
        console.error("Error deleting product:", error);
        alert("Error deleting product: " + (error.message || "Please try again."));
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };


  const clearAllProducts = async () => {
    if (confirm("Are you sure you want to delete ALL products? This cannot be undone!")) {
      try {
        // Delete all products one by one
        const deletePromises = products.map((product) =>
          fetch(`/api/products/${product.slug}`, { method: "DELETE" })
        );
        await Promise.all(deletePromises);
        
        setProducts([]);
        alert("All products have been deleted.");
      } catch (error) {
        console.error("Error clearing products:", error);
        alert("Error clearing products. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-cyan-neon">Admin Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">Manage your products</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-3">
            <button
              onClick={() => {
                loadProducts();
                router.refresh();
              }}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-neon hover:text-cyan-neon"
              title="Refresh products"
            >
              ↻ Refresh
            </button>
            <Link
              href="/admin/orders"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-neon hover:text-cyan-neon"
            >
              Orders
            </Link>
            <Link
              href="/admin/add-product"
              className="cta-btn text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-3"
            >
              + Add Product
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full border border-white/20 px-4 sm:px-5 py-2 sm:py-3 text-sm font-semibold text-white transition hover:border-red-500 hover:text-red-400"
            >
              Logout
            </button>
          </div>
          {products.length > 0 && (
            <button
              onClick={clearAllProducts}
              className="text-red-400 hover:text-red-300 transition-colors underline text-xs sm:text-sm"
              title="Delete all products"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab("posters")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "posters"
              ? "text-cyan-neon border-b-2 border-cyan-neon"
              : "text-white/60 hover:text-white"
          }`}
        >
          Posters ({products.filter((p) => p.type === "poster").length})
        </button>
        <button
          onClick={() => setActiveTab("polaroids")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "polaroids"
              ? "text-cyan-neon border-b-2 border-cyan-neon"
              : "text-white/60 hover:text-white"
          }`}
        >
          Polaroids ({products.filter((p) => p.type === "polaroid").length})
        </button>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-white/60 text-sm">Loading products...</p>
          </div>
        ) : products.filter((p) => p.type === activeTab.slice(0, -1)).length === 0 ? (
          <p className="text-white/60 text-sm">
            No {activeTab} yet. Use the &quot;Add Product&quot; button to create new items.
          </p>
        ) : (
          <div className="space-y-3">
            {products
              .filter((p) => p.type === activeTab.slice(0, -1))
              .map((product) => (
                <div
                  key={product.slug}
                  className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-black/30 hover:border-cyan-neon/50 transition-colors"
                >
                  {product.image && (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg text-white truncate">{product.title}</h3>
                    <p className="text-sm text-white/60">
                      {Array.isArray(product.category) ? product.category.join(", ") : product.category} •{" "}
                      {product.salePrice ? (
                        <>
                          <span className="text-cyan-neon">₹{product.salePrice}</span>
                          <span className="text-white/40 line-through ml-1">₹{product.price}</span>
                        </>
                      ) : (
                        <span>₹{product.price}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-xs text-cyan-neon hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/edit-product/${product.slug}`}
                      className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteProduct(product.slug)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

