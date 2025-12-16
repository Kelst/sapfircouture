import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: "us-east-1", // MinIO doesn't use regions, but it's required
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = process.env.S3_BUCKET!;
const PUBLIC_URL = process.env.S3_PUBLIC_URL!;

export async function uploadToS3(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split(".").pop() || "jpg";
  const key = `${nanoid()}.${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `${PUBLIC_URL}/${key}`;
}

export async function deleteFromS3(url: string): Promise<void> {
  const key = url.split("/").pop();
  if (!key) return;

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

export async function getPresignedUploadUrl(
  filename: string
): Promise<{ url: string; key: string }> {
  const extension = filename.split(".").pop() || "jpg";
  const key = `${nanoid()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { url, key };
}

export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}
