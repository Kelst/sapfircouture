-- Add anti-spam fields to contact_requests table
ALTER TABLE "contact_requests" ADD COLUMN "ip_address" varchar(45);
ALTER TABLE "contact_requests" ADD COLUMN "user_agent" text;

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS "contact_requests_phone_created_idx" ON "contact_requests" ("phone", "created_at");
CREATE INDEX IF NOT EXISTS "contact_requests_ip_created_idx" ON "contact_requests" ("ip_address", "created_at");
