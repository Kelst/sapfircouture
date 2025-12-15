import { z } from "zod";

export const dressSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional().nullable(),
  collectionId: z.string().uuid("Valid collection is required"),
  styleId: z.string().uuid("Style is required"),
  images: z.array(z.string().url()).default([]),
  videos: z.array(z.string().url()).max(3).default([]),
  isPublished: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const createDressSchema = dressSchema;
export const updateDressSchema = dressSchema.partial();

// Use z.input for form types (includes optional fields before defaults applied)
export type DressInput = z.input<typeof dressSchema>;
export type DressOutput = z.output<typeof dressSchema>;
export type CreateDressInput = z.input<typeof createDressSchema>;
export type UpdateDressInput = z.input<typeof updateDressSchema>;
