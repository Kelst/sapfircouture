"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import {
  createHeroSlide,
  updateHeroSlide,
  type HeroSlideInput,
} from "@/actions/hero-slides.actions";
import type { HeroSlide } from "@/lib/db/schema";

interface HeroSlideFormProps {
  slide?: HeroSlide;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  image: z.string().min(1, "Image is required"),
  titleEn: z.string().max(255).optional(),
  titleUk: z.string().max(255).optional(),
  subtitleEn: z.string().optional(),
  subtitleUk: z.string().optional(),
  linkUrl: z.string().max(255).optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function HeroSlideForm({
  slide,
  open,
  onOpenChange,
  onSuccess,
}: HeroSlideFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: slide?.image ?? "",
      titleEn: slide?.titleEn ?? "",
      titleUk: slide?.titleUk ?? "",
      subtitleEn: slide?.subtitleEn ?? "",
      subtitleUk: slide?.subtitleUk ?? "",
      linkUrl: slide?.linkUrl ?? "",
      isActive: slide?.isActive ?? true,
    },
  });

  // Reset form when slide changes
  const resetForm = useCallback(() => {
    form.reset({
      image: slide?.image ?? "",
      titleEn: slide?.titleEn ?? "",
      titleUk: slide?.titleUk ?? "",
      subtitleEn: slide?.subtitleEn ?? "",
      subtitleUk: slide?.subtitleUk ?? "",
      linkUrl: slide?.linkUrl ?? "",
      isActive: slide?.isActive ?? true,
    });
  }, [slide, form]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      form.setValue("image", data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const input: HeroSlideInput = {
        image: data.image,
        titleEn: data.titleEn || undefined,
        titleUk: data.titleUk || undefined,
        subtitleEn: data.subtitleEn || undefined,
        subtitleUk: data.subtitleUk || undefined,
        linkUrl: data.linkUrl || undefined,
        isActive: data.isActive,
      };

      if (slide) {
        await updateHeroSlide(slide.id, input);
        toast.success("Slide updated");
      } else {
        await createHeroSlide(input);
        toast.success("Slide created");
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch {
      toast.error("Failed to save slide");
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageUrl = form.watch("image");

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {slide ? "Edit Hero Slide" : "Add Hero Slide"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Image *</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {imageUrl ? (
                        <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border bg-muted">
                          <img
                            src={imageUrl}
                            alt="Hero slide preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={() => form.setValue("image", "")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="aspect-[16/9] w-full rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 bg-muted/50">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Upload hero image (recommended 1920x1080)
                          </p>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={(e) => handleUpload(e.target.files)}
                        className="hidden"
                        id="hero-image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                        onClick={() =>
                          document.getElementById("hero-image-upload")?.click()
                        }
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? "Uploading..." : "Upload Image"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Titles */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="titleEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (EN)</FormLabel>
                    <FormControl>
                      <Input placeholder="Discover Elegance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titleUk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (UK)</FormLabel>
                    <FormControl>
                      <Input placeholder="Відкрийте елегантність" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Subtitles */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subtitleEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle (EN)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Find your perfect wedding dress"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtitleUk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle (UK)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Знайдіть ідеальну весільну сукню"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Link URL */}
            <FormField
              control={form.control}
              name="linkUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link URL</FormLabel>
                  <FormControl>
                    <Input placeholder="/catalog" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional URL for the CTA button (e.g., /catalog, /contacts)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Toggle */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Show this slide on the homepage
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {slide ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
