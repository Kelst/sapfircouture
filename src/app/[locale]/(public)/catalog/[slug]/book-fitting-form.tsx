"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { submitContact } from "@/lib/api/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Check, Loader2 } from "lucide-react";

const bookingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookFittingFormProps {
  dressId: string;
  dressName: string;
}

export function BookFittingForm({ dressId, dressName }: BookFittingFormProps) {
  const t = useTranslations("dress");
  const tForm = useTranslations("contacts.form");
  const tCommon = useTranslations("contacts");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(data: BookingFormData) {
    setIsSubmitting(true);
    try {
      const response = await submitContact({
        ...data,
        dressId,
        locale,
        message: data.message
          ? `[${dressName}] ${data.message}`
          : `Interested in: ${dressName}`,
      });

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          form.reset();
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="btn-gold w-full">
          {t("bookFitting")}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light text-center">
            {t("bookFitting")}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {dressName}
          </p>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-gold" />
            </div>
            <p className="text-lg font-serif">{tCommon("success")}</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                      {tForm("name")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-0 border-b rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-gold"
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
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                      {tForm("phone")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        className="border-0 border-b rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-gold"
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
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                      {tForm("email")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        className="border-0 border-b rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-gold"
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
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                      {tForm("message")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        {...field}
                        className="border-0 border-b rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-gold resize-none"
                        placeholder="Optional notes..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "btn-gold w-full mt-6",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  tForm("submit")
                )}
              </button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
