"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { FileText, Loader2, Upload, X } from "lucide-react";
import {
  saveContentSettings,
  type ContentSettings,
} from "@/actions/settings.actions";

interface ContentSettingsFormProps {
  initialSettings: ContentSettings;
}

const formSchema = z.object({
  brandStatementEn: z.string().max(1000),
  brandStatementUk: z.string().max(1000),
  aboutContentEn: z.string().max(10000),
  aboutContentUk: z.string().max(10000),
  ctaBannerImage: z.string(),
  ctaBannerTextEn: z.string().max(500),
  ctaBannerTextUk: z.string().max(500),
});

type FormInput = z.infer<typeof formSchema>;

export function ContentSettingsForm({
  initialSettings,
}: ContentSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandStatementEn: initialSettings.brandStatementEn,
      brandStatementUk: initialSettings.brandStatementUk,
      aboutContentEn: initialSettings.aboutContentEn,
      aboutContentUk: initialSettings.aboutContentUk,
      ctaBannerImage: initialSettings.ctaBannerImage,
      ctaBannerTextEn: initialSettings.ctaBannerTextEn,
      ctaBannerTextUk: initialSettings.ctaBannerTextUk,
    },
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("optimize", "true"); // Optimize CTA Banner images

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      form.setValue("ctaBannerImage", data.url);
      toast.success("Image uploaded and optimized");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(data: FormInput) {
    setIsSaving(true);
    try {
      await saveContentSettings(data);
      toast.success("Content settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }

  const ctaBannerImage = form.watch("ctaBannerImage");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Website Content
        </CardTitle>
        <CardDescription>
          Brand statement, about page, and CTA banner content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Brand Statement Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Brand Statement</h3>
              <p className="text-sm text-muted-foreground">
                Displayed on the homepage between sections
              </p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brandStatementEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>English</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Where elegance meets timeless beauty..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandStatementUk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ukrainian</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Де елегантність зустрічає вічну красу..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* About Page Section */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-medium">About Page Content</h3>
              <p className="text-sm text-muted-foreground">
                Main content for the About Us page (supports basic formatting)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="aboutContentEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>English</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Sapfir Couture is a premium bridal salon..."
                          rows={8}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Use double line breaks for paragraphs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aboutContentUk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ukrainian</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Sapfir Couture - це преміум весільний салон..."
                          rows={8}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Використовуйте подвійні переноси для абзаців
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* CTA Banner Section */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-medium">CTA Banner</h3>
              <p className="text-sm text-muted-foreground">
                &quot;Book a Fitting&quot; banner displayed on the homepage
              </p>

              {/* Banner Image */}
              <div className="space-y-2">
                <FormLabel>Banner Background Image</FormLabel>
                {ctaBannerImage ? (
                  <div className="relative aspect-[21/9] w-full max-w-xl rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={ctaBannerImage}
                      alt="CTA Banner preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => form.setValue("ctaBannerImage", "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-[21/9] w-full max-w-xl rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 bg-muted/50">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Upload banner image (recommended 1920x600)
                    </p>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={(e) => handleUpload(e.target.files)}
                  className="hidden"
                  id="cta-banner-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  onClick={() =>
                    document.getElementById("cta-banner-upload")?.click()
                  }
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload Image"}
                </Button>
              </div>

              {/* Banner Text */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ctaBannerTextEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text (EN)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Find your perfect dress. Book your exclusive fitting today."
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
                  name="ctaBannerTextUk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text (UK)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Знайдіть свою ідеальну сукню. Запишіться на ексклюзивну примірку."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSaving || isUploading}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
