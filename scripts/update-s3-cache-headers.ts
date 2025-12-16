/**
 * Script to update Cache-Control headers for all existing files in MinIO/S3
 * Run with: npx tsx scripts/update-s3-cache-headers.ts
 */

import {
  S3Client,
  ListObjectsV2Command,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin123",
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.S3_BUCKET || "wedding-uploads";
const CACHE_CONTROL = "public, max-age=31536000, immutable";

async function updateCacheHeaders() {
  console.log(`Updating Cache-Control headers for bucket: ${BUCKET_NAME}`);
  console.log(`Cache-Control: ${CACHE_CONTROL}\n`);

  let continuationToken: string | undefined;
  let totalUpdated = 0;
  let totalFailed = 0;

  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      ContinuationToken: continuationToken,
    });

    const listResponse = await s3Client.send(listCommand);
    const objects = listResponse.Contents || [];

    for (const obj of objects) {
      if (!obj.Key) continue;

      try {
        // Copy object to itself with new metadata
        await s3Client.send(
          new CopyObjectCommand({
            Bucket: BUCKET_NAME,
            Key: obj.Key,
            CopySource: `${BUCKET_NAME}/${encodeURIComponent(obj.Key)}`,
            CacheControl: CACHE_CONTROL,
            MetadataDirective: "REPLACE",
            ContentType: getContentType(obj.Key),
          })
        );

        totalUpdated++;
        console.log(`✓ Updated: ${obj.Key}`);
      } catch (error) {
        totalFailed++;
        console.error(`✗ Failed: ${obj.Key}`, error);
      }
    }

    continuationToken = listResponse.NextContinuationToken;
  } while (continuationToken);

  console.log(`\nDone! Updated: ${totalUpdated}, Failed: ${totalFailed}`);
}

function getContentType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    avif: "image/avif",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
  };
  return types[ext || ""] || "application/octet-stream";
}

updateCacheHeaders().catch(console.error);
