import { z } from "zod";

export const styleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export const createStyleSchema = styleSchema;
export const updateStyleSchema = styleSchema.partial();

export type StyleInput = z.infer<typeof styleSchema>;
export type CreateStyleInput = z.infer<typeof createStyleSchema>;
export type UpdateStyleInput = z.infer<typeof updateStyleSchema>;
