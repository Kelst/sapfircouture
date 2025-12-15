ALTER TABLE "styles" DROP CONSTRAINT "styles_slug_unique";--> statement-breakpoint
ALTER TABLE "collections" DROP COLUMN "cover_image";--> statement-breakpoint
ALTER TABLE "styles" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "styles" ADD CONSTRAINT "styles_name_unique" UNIQUE("name");