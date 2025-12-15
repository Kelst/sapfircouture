import { z } from "zod";

export const collectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().nullable().optional(),
  order: z.number().int().min(0),
});

export const createCollectionSchema = collectionSchema;
export const updateCollectionSchema = collectionSchema.partial();

export type CollectionInput = z.infer<typeof collectionSchema>;
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
