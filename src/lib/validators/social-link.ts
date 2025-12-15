import { z } from "zod";

export const createSocialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required").max(50),
  url: z.string().url("Invalid URL").max(500),
  enabled: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

export const updateSocialLinkSchema = z.object({
  url: z.string().url("Invalid URL").max(500).optional(),
  enabled: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export type CreateSocialLinkInput = z.infer<typeof createSocialLinkSchema>;
export type UpdateSocialLinkInput = z.infer<typeof updateSocialLinkSchema>;
