import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20)
    .regex(/^[+\d\s()-]+$/, "Invalid phone number format"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255)
    .optional()
    .or(z.literal("")),
  message: z.string().max(1000).optional(),
  dressId: z.string().uuid().optional().nullable(),
});

export type ContactInput = z.infer<typeof contactSchema>;
