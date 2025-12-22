import { NextRequest, NextResponse } from "next/server";

// This route is kept for backward compatibility but is no longer used
// Images are now compressed client-side and sent directly as base64
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB for base64 - smaller limit since base64 increases size)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: `Image size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit` },
        { status: 400 }
      );
    }

    try {
      // Convert file to base64 data URL
      // This stores the image directly in MongoDB, making it work on serverless platforms
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";
      const imageUrl = `data:${mimeType};base64,${base64}`;

      // Validate base64 conversion was successful
      if (!imageUrl || imageUrl.length === 0) {
        throw new Error("Failed to convert image to base64");
      }

      return NextResponse.json(
        { success: true, imageUrl },
        { status: 200 }
      );
    } catch (conversionError: any) {
      console.error("Error converting image to base64:", conversionError);
      return NextResponse.json(
        { success: false, error: `Image conversion failed: ${conversionError.message || "Unknown error"}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error uploading image:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

