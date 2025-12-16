"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { submitContact } from "@/lib/api/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Check, Loader2, AlertCircle } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  message: z.string().optional(),
  // Honeypot - should always be empty
  website: z.string().max(0).optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  dressId?: string;
}

export function ContactForm({ dressId }: ContactFormProps) {
  const t = useTranslations("contacts.form");
  const tCommon = useTranslations("contacts");
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
      website: "", // Honeypot
    },
  });

  async function onSubmit(data: ContactFormData) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await submitContact({
        ...data,
        dressId,
        locale,
      });

      if (response.success) {
        setIsSuccess(true);
        form.reset();
      } else {
        // Handle specific error codes
        const errorCode = response.error?.code;
        if (errorCode === "RATE_LIMIT_EXCEEDED") {
          setErrorMessage(tCommon("errors.rateLimit"));
        } else if (errorCode === "DUPLICATE_REQUEST") {
          setErrorMessage(tCommon("errors.duplicate"));
        } else if (errorCode === "VALIDATION_ERROR") {
          setErrorMessage(tCommon("errors.validation"));
        } else {
          setErrorMessage(tCommon("error"));
        }
      }
    } catch (error) {
      console.error("Failed to submit:", error);
      setErrorMessage(tCommon("error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
          <Check className="w-10 h-10 text-gold" />
        </div>
        <h3 className="font-serif text-2xl mb-2">{tCommon("success")}</h3>
        <p className="text-muted-foreground">
          We will get back to you shortly.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-6 text-sm text-gold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Honeypot field - hidden from users, bots will fill it */}
        <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("website")}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {t("name")} *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className={cn(
                    "border-0 border-b-2 rounded-none bg-transparent px-0 py-3",
                    "focus-visible:ring-0 focus-visible:border-gold",
                    "transition-colors"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {t("phone")} *
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  {...field}
                  className={cn(
                    "border-0 border-b-2 rounded-none bg-transparent px-0 py-3",
                    "focus-visible:ring-0 focus-visible:border-gold",
                    "transition-colors"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {t("email")}
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  className={cn(
                    "border-0 border-b-2 rounded-none bg-transparent px-0 py-3",
                    "focus-visible:ring-0 focus-visible:border-gold",
                    "transition-colors"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {t("message")}
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  {...field}
                  className={cn(
                    "border-0 border-b-2 rounded-none bg-transparent px-0 py-3",
                    "focus-visible:ring-0 focus-visible:border-gold",
                    "transition-colors resize-none"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "btn-gold w-full mt-8",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            t("submit")
          )}
        </button>
      </form>
    </Form>
  );
}
