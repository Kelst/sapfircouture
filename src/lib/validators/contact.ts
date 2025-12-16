import { z } from "zod";

// Clean phone number - remove spaces, dashes, parentheses
function cleanPhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "");
}

// Validate phone has enough digits (7-15 after cleaning)
function isValidPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  const digitsOnly = cleaned.replace(/\D/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .refine((val) => val.trim().length >= 2, {
      message: "Name must be at least 2 characters",
    }),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20)
    .refine((val) => isValidPhone(val), {
      message: "Please enter a valid phone number",
    })
    .transform(cleanPhone),
  email: z
    .string()
    .email("Invalid email address")
    .max(255)
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .max(1000)
    .optional(),
  dressId: z.string().uuid().optional().nullable(),
  locale: z.string().max(5).optional(),
  // Honeypot field - should always be empty
  website: z.string().max(0, "Bot detected").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
