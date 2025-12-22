"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import Link from "next/link";
import type { Product } from "@/data/products";

export default function AddProduct() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();
  const [productType, setProductType] = useState<"poster" | "polaroid">("poster");
  const [formData, setFormData] = useState({
    title: "",
    categories: [] as string[],
    price: "",
    description: "",
    tag: "",
    accent: "#08f7fe",
    image: "",
  });
  const [saved, setSaved] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  const categories = ["Movies", "Sports", "Cars", "Anime", "Music", "More"];
  const posterSizes = ["Small", "Medium", "Large"];
  const polaroidSizes = ["Pocket", "Classic"];

  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      
      // Validate file size (max 15MB)
      if (file.size > 15 * 1024 * 1024) {
        alert("Image size must be less than 15MB");
        return;
      }

      try {
        // Store the file for upload
        setImageFile(file);
        
        // Compress image for preview only
        const compressedImage = await compressImage(file, 1200, 0.75);
        setImagePreview(compressedImage);
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Error processing image. Please try again.");
      }
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.categories.length === 0) {
      alert("Please select at least one category");
      return;
    }
    
    setUploading(true);
    
    try {
      let imageUrl = "";
      
      // Upload image if provided
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", imageFile);
        
        const uploadResponse = await fetch("/api/products/upload", {
          method: "POST",
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Failed to upload image");
        }
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
      }
      
      const slug = formData.title.toLowerCase().replace(/\s+/g, "-");
      
      // Create product via API
      const productResponse = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          title: formData.title,
          category: formData.categories.length === 1 ? formData.categories[0] : formData.categories,
          type: productType,
          price: formData.price,
          sizes: productType === "poster" ? posterSizes : polaroidSizes,
          description: formData.description,
          tag: formData.tag || formData.categories[0],
          accent: formData.accent,
          image: imageUrl,
        }),
      });
      
      if (!productResponse.ok) {
        const errorData = await productResponse.json();
        throw new Error(errorData.error || "Failed to create product");
      }
      
      setSaved(true);
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1500);
    } catch (error: any) {
      alert("Error saving product: " + error.message);
      console.error("Error saving product:", error);
      setUploading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-cyan-neon">Add New Product</h1>
          <p className="text-white/60 text-sm mt-1">Create a new poster or polaroid</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-neon hover:text-cyan-neon"
        >
          ← Back
        </Link>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Type */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-3">Product Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setProductType("poster")}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                  productType === "poster"
                    ? "border-cyan-neon bg-cyan-neon text-black"
                    : "border-white/15 text-white/80 hover:border-cyan-neon"
                }`}
              >
                Poster
              </button>
              <button
                type="button"
                onClick={() => setProductType("polaroid")}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                  productType === "polaroid"
                    ? "border-cyan-neon bg-cyan-neon text-black"
                    : "border-white/15 text-white/80 hover:border-cyan-neon"
                }`}
              >
                Polaroid
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-white/80 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
              placeholder="e.g., Neon Drift"
              required
            />
          </div>

          {/* Categories - Multiple Selection */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-3">
              Categories * (Select one or more)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryToggle(cat)}
                  className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${
                    formData.categories.includes(cat)
                      ? "border-cyan-neon bg-cyan-neon text-black shadow-neon"
                      : "border-white/15 text-white/80 hover:border-cyan-neon hover:bg-cyan-neon/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {formData.categories.length > 0 && (
              <p className="mt-2 text-xs text-white/50">
                Selected: {formData.categories.join(", ")}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-white/80 mb-2">
              Price (₹) *
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
              placeholder="e.g., 38"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-white/80 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors min-h-[100px]"
              placeholder="e.g., Electric lines and bold geometry inspired by synthwave skylines."
              required
            />
          </div>

          {/* Tag */}
          <div>
            <label htmlFor="tag" className="block text-sm font-semibold text-white/80 mb-2">
              Tag
            </label>
            <input
              id="tag"
              type="text"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-neon transition-colors"
              placeholder="e.g., Cyan glow (optional)"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-semibold text-white/80 mb-2">
              Product Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-neon file:text-black file:cursor-pointer hover:file:bg-cyan-neon/90 focus:outline-none focus:border-cyan-neon transition-colors"
            />
            <p className="mt-1 text-xs text-white/50">
              Upload a JPG, PNG, or WebP image (max 15MB). If no image is provided, a gradient will be used.
            </p>
            {imagePreview && (
              <div className="mt-4 rounded-lg border border-white/10 overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            )}
          </div>

          {/* Accent Color */}
          <div>
            <label htmlFor="accent" className="block text-sm font-semibold text-white/80 mb-2">
              Accent Color (Hex) - Used if no image is provided
            </label>
            <input
              id="accent"
              type="color"
              value={formData.accent}
              onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
              className="w-full h-12 rounded-lg border border-white/10 bg-black/50 focus:outline-none focus:border-cyan-neon transition-colors cursor-pointer"
            />
          </div>

          {saved && (
            <div className="rounded-lg border border-cyan-neon/50 bg-cyan-neon/10 px-4 py-3 text-sm text-cyan-neon">
              Product added successfully! Redirecting...
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saved || uploading}
              className="cta-btn flex-1 text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : saved ? "Saved!" : "Add Product"}
            </button>
            <Link
              href="/admin/dashboard"
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-neon hover:text-cyan-neon"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

