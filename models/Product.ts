import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  slug: string;
  title: string;
  category: string | string[];
  type: "poster" | "polaroid";
  price: number;
  salePrice?: number; // Optional sale price
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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
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

const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

