import { NextRequest, NextResponse } from "next/server";
import { uploadToS3 } from "@/lib/storage/s3";
import { getSession } from "@/lib/auth/helpers";
import sharp from "sharp";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// CTA Banner optimization settings
const CTA_MAX_WIDTH = 1920;
const CTA_QUALITY = 85;

async function optimizeCtaImage(file: File): Promise<File> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Optimize and convert to WebP
  const optimizedBuffer = await sharp(buffer)
    .resize(CTA_MAX_WIDTH, undefined, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: CTA_QUALITY })
    .toBuffer();

  const originalName = file.name.replace(/\.[^.]+$/, "");
  const filename = `${originalName}.webp`;

  const uint8Array = new Uint8Array(optimizedBuffer);
  return new File([uint8Array], filename, { type: "image/webp" });
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const optimize = formData.get("optimize") === "true"; // For CTA Banner

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, MP4, WebM, MOV" },
        { status: 400 }
      );
    }

    // Determine if video and set appropriate max size
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    // Validate file size
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${isVideo ? "100MB" : "10MB"}` },
        { status: 400 }
      );
    }

    let fileToUpload = file;

    // Optimize only if requested (for CTA Banner)
    if (optimize && !isVideo && file.type !== "image/gif") {
      try {
        fileToUpload = await optimizeCtaImage(file);
      } catch (error) {
        console.error("Image optimization failed, uploading original:", error);
        // Fall back to original file if optimization fails
      }
    }

    const url = await uploadToS3(fileToUpload);

    return NextResponse.json({
      url,
      type: isVideo ? "video" : "image",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
