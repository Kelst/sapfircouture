-- Convert video (text) to videos (jsonb array)
-- First, add the new videos column
ALTER TABLE "dresses" ADD COLUMN "videos" jsonb DEFAULT '[]'::jsonb NOT NULL;

-- Migrate existing video data to videos array
UPDATE "dresses" SET "videos" = jsonb_build_array("video") WHERE "video" IS NOT NULL;

-- Drop the old video column
ALTER TABLE "dresses" DROP COLUMN "video";
