import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  slug: string;
  title: string;
  category: string | string[];
  type: "poster" | "polaroid";
  size: "A3" | "A4"; // Product size (A3 or A4)
  price: number;
  salePrice?: number; // Optional sale price
  priceA3?: number; // Price for A3 size (deprecated - kept for backward compatibility)
  priceA4?: number; // Price for A4 size (deprecated - kept for backward compatibility)
  salePriceA3?: number; // Optional sale price for A3 (deprecated)
  salePriceA4?: number; // Optional sale price for A4 (deprecated)
  sizes: string[];
  description: string;
  tag?: string;
  accent?: string;
  image?: string; // URL to image file
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.Mixed, // Can be string or array
      required: true,
    },
    type: {
      type: String,
      enum: ["poster", "polaroid"],
      required: true,
    },
    size: {
      type: String,
      enum: ["A3", "A4"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    priceA3: {
      type: Number,
      // Not required - deprecated, kept for backward compatibility
      min: 0,
    },
    priceA4: {
      type: Number,
      // Not required - deprecated, kept for backward compatibility
      min: 0,
    },
    salePriceA3: {
      type: Number,
      min: 0,
    },
    salePriceA4: {
      type: Number,
      min: 0,
    },
    sizes: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: "",
    },
    accent: {
      type: String,
      default: "#08f7fe",
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
ProductSchema.index({ type: 1 });

// Delete the model if it exists to force recompilation with new schema
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const Product = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

