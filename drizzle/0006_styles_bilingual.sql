-- Migration: Add bilingual support for styles (nameEn/nameUk)

-- Step 1: Rename 'name' column to 'name_en'
ALTER TABLE "styles" RENAME COLUMN "name" TO "name_en";

-- Step 2: Add 'name_uk' column (nullable for optional Ukrainian translation)
ALTER TABLE "styles" ADD COLUMN "name_uk" varchar(100);

-- Step 3: Add 'updated_at' column
ALTER TABLE "styles" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;
