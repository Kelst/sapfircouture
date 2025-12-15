"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createSocialLink, updateSocialLink } from "@/actions/social-link.actions";
import { SOCIAL_PLATFORMS, getPlatformIcon } from "@/lib/constants/social-platforms";
import type { SocialLink } from "@/lib/db/schema";

interface SocialLinkFormProps {
  link?: SocialLink;
  existingPlatforms: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url("Invalid URL"),
});

type FormInput = z.infer<typeof formSchema>;

export function SocialLinkForm({
  link,
  existingPlatforms,
  open,
  onOpenChange,
  onSuccess,
}: SocialLinkFormProps) {
  const isEditing = !!link;

  // Filter out already used platforms (except current one when editing)
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !existingPlatforms.includes(p.id) || (isEditing && link?.platform === p.id)
  );

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: link?.platform ?? "",
      url: link?.url ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        platform: link?.platform ?? "",
        url: link?.url ?? "",
      });
    }
  }, [open, link, form]);

  async function onSubmit(data: FormInput) {
    try {
      if (isEditing && link) {
        await updateSocialLink(link.id, { url: data.url });
        toast.success("Link updated");
      } else {
        await createSocialLink({
          platform: data.platform,
          url: data.url,
          enabled: true,
          order: 0,
        });
        toast.success("Link added");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    }
  }

  const selectedPlatform = form.watch("platform");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Link" : "Add Social Link"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform">
                          {selectedPlatform && (
                            <div className="flex items-center gap-2">
                              <Image
                                src={getPlatformIcon(selectedPlatform)}
                                alt=""
                                width={20}
                                height={20}
                                className="shrink-0"
                              />
                              {SOCIAL_PLATFORMS.find((p) => p.id === selectedPlatform)?.name}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePlatforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src={getPlatformIcon(platform.id)}
                              alt=""
                              width={20}
                              height={20}
                              className="shrink-0"
                            />
                            {platform.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://instagram.com/yourpage"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
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
                  : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
