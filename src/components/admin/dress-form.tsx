"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "./image-uploader";
import { VideoUploader } from "./video-uploader";
import { toast } from "sonner";
import { dressSchema, type DressInput } from "@/lib/validators/dress";
import { createDress, updateDress } from "@/actions/dress.actions";
import { getStyles, createStyle } from "@/actions/style.actions";
import type { Dress, Style } from "@/lib/db/schema";
import { Check, Loader2, Circle, Plus } from "lucide-react";

interface DressFormProps {
  dress?: Dress;
  collectionId: string;
}

type SaveStatus = "idle" | "unsaved" | "saving" | "saved";

export function DressForm({ dress, collectionId }: DressFormProps) {
  const router = useRouter();
  const isEditing = !!dress;
  const [styles, setStyles] = useState<Style[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // New style dialog state
  const [newStyleDialogOpen, setNewStyleDialogOpen] = useState(false);
  const [newStyleName, setNewStyleName] = useState("");
  const [isCreatingStyle, setIsCreatingStyle] = useState(false);
  const [styleError, setStyleError] = useState("");

  useEffect(() => {
    getStyles().then(setStyles);
  }, []);

  const form = useForm<DressInput>({
    resolver: zodResolver(dressSchema),
    defaultValues: {
      name: dress?.name ?? "",
      slug: dress?.slug ?? "",
      description: dress?.description ?? "",
      collectionId: dress?.collectionId ?? collectionId,
      styleId: dress?.styleId ?? "",
      images: dress?.images ?? [],
      videos: dress?.videos ?? [],
      isPublished: dress?.isPublished ?? false,
      order: dress?.order ?? 0,
    },
  });

  const handleCreateStyle = async () => {
    const trimmedName = newStyleName.trim();
    if (!trimmedName) return;

    setStyleError("");

    // Check if style with this name already exists
    const exists = styles.some(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      setStyleError("Style with this name already exists");
      return;
    }

    setIsCreatingStyle(true);
    try {
      const newStyle = await createStyle({ name: trimmedName });
      setStyles((prev) => [...prev, newStyle].sort((a, b) => a.name.localeCompare(b.name)));
      form.setValue("styleId", newStyle.id);
      setNewStyleDialogOpen(false);
      setNewStyleName("");
      setStyleError("");
      toast.success("Style created");
      if (isEditing) immediateAutoSave();
    } catch (error) {
      setStyleError("Failed to create style");
    } finally {
      setIsCreatingStyle(false);
    }
  };

  const autoSave = useCallback(async () => {
    if (!isEditing || !dress) return;

    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    setSaveStatus("saving");

    try {
      await updateDress(dress.id, data);
      setSaveStatus("saved");

      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (error) {
      setSaveStatus("unsaved");
      toast.error("Failed to save changes");
    }
  }, [isEditing, dress, form]);

  const scheduleAutoSave = useCallback(() => {
    if (!isEditing) return;
    setSaveStatus("unsaved");

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1000);
  }, [isEditing, autoSave]);

  const immediateAutoSave = useCallback(() => {
    if (!isEditing) return;
    setSaveStatus("unsaved");

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 300);
  }, [isEditing, autoSave]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  const handleNameChange = (value: string) => {
    if (!isEditing || !dress?.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("slug", slug);
    }
  };

  async function onSubmit(data: DressInput) {
    try {
      if (isEditing) {
        await updateDress(dress.id, data);
        toast.success("Dress updated");
      } else {
        await createDress(data);
        toast.success("Dress created");
      }
      router.push(`/admin/collections/${collectionId}`);
    } catch (error) {
      toast.error(isEditing ? "Failed to update dress" : "Failed to create dress");
    }
  }

  const SaveStatusIndicator = () => {
    if (!isEditing) return null;

    return (
      <div className="flex items-center gap-2 text-sm">
        {saveStatus === "saving" && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Saving...</span>
          </>
        )}
        {saveStatus === "saved" && (
          <>
            <Check className="h-3.5 w-3.5 text-green-600" />
            <span className="text-green-600">Saved</span>
          </>
        )}
        {saveStatus === "unsaved" && (
          <>
            <Circle className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span className="text-amber-600">Unsaved</span>
          </>
        )}
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-6xl">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>{isEditing ? "Edit Dress" : "Add New Dress"}</CardTitle>
              <CardDescription className="mt-1">
                {isEditing ? "Update dress information" : "Fill in the details for the new dress"}
              </CardDescription>
            </div>
            <SaveStatusIndicator />
          </CardHeader>

          <CardContent className="space-y-6 overflow-hidden">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 items-start">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleNameChange(e.target.value);
                            if (isEditing) scheduleAutoSave();
                          }}
                          onBlur={() => {
                            field.onBlur();
                            if (isEditing && saveStatus === "unsaved") autoSave();
                          }}
                          placeholder="Elegant Lace Gown"
                        />
                      </FormControl>
                      <FormDescription>&nbsp;</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (isEditing) scheduleAutoSave();
                          }}
                          onBlur={() => {
                            field.onBlur();
                            if (isEditing && saveStatus === "unsaved") autoSave();
                          }}
                          placeholder="elegant-lace-gown"
                        />
                      </FormControl>
                      <FormDescription>URL-friendly identifier</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 items-start">
                <FormField
                  control={form.control}
                  name="styleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style *</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            immediateAutoSave();
                          }}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {styles.map((style) => (
                              <SelectItem key={style.id} value={style.id}>
                                {style.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => setNewStyleDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormDescription>&nbsp;</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <div className="flex items-center gap-3 rounded-lg border px-3 h-9">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) => {
                              field.onChange(value);
                              immediateAutoSave();
                            }}
                          />
                        </FormControl>
                        <span className="text-sm">
                          {field.value ? "Published" : "Draft"}
                        </span>
                      </div>
                      <FormDescription>
                        {field.value ? "Visible on public website" : "Hidden from public"}
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          field.onChange(e);
                          if (isEditing) scheduleAutoSave();
                        }}
                        onBlur={() => {
                          field.onBlur();
                          if (isEditing && saveStatus === "unsaved") autoSave();
                        }}
                        placeholder="A stunning wedding dress with intricate lace details..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Images Section */}
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormDescription className="mt-0 mb-3">
                    Upload photos of the dress. First image will be the main image.
                  </FormDescription>
                  <FormControl>
                    <ImageUploader
                      value={field.value ?? []}
                      onChange={(value) => {
                        field.onChange(value);
                        immediateAutoSave();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Videos Section */}
            <FormField
              control={form.control}
              name="videos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Videos (optional)</FormLabel>
                  <FormDescription className="mt-0 mb-3">
                    Upload up to 3 presentation videos (MP4, WebM, max 100MB each)
                  </FormDescription>
                  <FormControl>
                    <VideoUploader
                      value={field.value ?? []}
                      onChange={(value) => {
                        field.onChange(value);
                        immediateAutoSave();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {isEditing ? "Back to Collection" : "Cancel"}
              </Button>

              {!isEditing && (
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Creating..." : "Add Dress"}
                </Button>
              )}

              {isEditing && <SaveStatusIndicator />}
            </div>
          </CardContent>
        </Card>
      </form>

      {/* New Style Dialog */}
      <Dialog
        open={newStyleDialogOpen}
        onOpenChange={(open) => {
          setNewStyleDialogOpen(open);
          if (!open) {
            setNewStyleName("");
            setStyleError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Style</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Input
              placeholder="Style name"
              value={newStyleName}
              onChange={(e) => {
                setNewStyleName(e.target.value);
                setStyleError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateStyle();
                }
              }}
            />
            {styleError && (
              <p className="text-sm text-destructive">{styleError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewStyleDialogOpen(false);
                setNewStyleName("");
                setStyleError("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateStyle} disabled={isCreatingStyle || !newStyleName.trim()}>
              {isCreatingStyle ? "Creating..." : "Create Style"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
