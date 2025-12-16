"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { styleSchema, type StyleInput } from "@/lib/validators/style";
import { createStyle, updateStyle } from "@/actions/style.actions";
import type { Style } from "@/lib/db/schema";

interface StyleFormProps {
  style?: Style;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function StyleForm({ style, open, onOpenChange, onSuccess }: StyleFormProps) {
  const isEditing = !!style;

  const form = useForm<StyleInput>({
    resolver: zodResolver(styleSchema),
    defaultValues: {
      nameEn: style?.nameEn ?? "",
      nameUk: style?.nameUk ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nameEn: style?.nameEn ?? "",
        nameUk: style?.nameUk ?? "",
      });
    }
  }, [open, style, form]);

  async function onSubmit(data: StyleInput) {
    try {
      if (isEditing && style) {
        await updateStyle(style.id, data);
        toast.success("Style updated");
      } else {
        await createStyle(data);
        toast.success("Style created");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(isEditing ? "Failed to update style" : "Failed to create style");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Style" : "Add Style"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (EN) *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="A-Line" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameUk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (UK)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="А-силует" />
                  </FormControl>
                  <FormDescription>
                    Optional. If empty, English name will be shown.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
