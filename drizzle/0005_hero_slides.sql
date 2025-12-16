-- Hero slides table
CREATE TABLE IF NOT EXISTS "hero_slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image" text NOT NULL,
	"title_en" varchar(255),
	"title_uk" varchar(255),
	"subtitle_en" text,
	"subtitle_uk" text,
	"link_url" varchar(255),
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add is_featured column to collections
ALTER TABLE "collections" ADD COLUMN IF NOT EXISTS "is_featured" boolean DEFAULT false NOT NULL;
