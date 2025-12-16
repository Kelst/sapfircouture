-- Add view_count column to dresses table
ALTER TABLE "dresses" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;

-- Create dress_views table for detailed tracking
CREATE TABLE IF NOT EXISTS "dress_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dress_id" uuid NOT NULL,
	"visitor_hash" varchar(64),
	"ip_address" varchar(45),
	"locale" varchar(5),
	"viewed_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE "dress_views" ADD CONSTRAINT "dress_views_dress_id_dresses_id_fk" FOREIGN KEY ("dress_id") REFERENCES "public"."dresses"("id") ON DELETE cascade ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "dress_views_dress_id_idx" ON "dress_views" USING btree ("dress_id");
CREATE INDEX IF NOT EXISTS "dress_views_viewed_at_idx" ON "dress_views" USING btree ("viewed_at");
CREATE INDEX IF NOT EXISTS "dress_views_visitor_hash_idx" ON "dress_views" USING btree ("visitor_hash");
