"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  getSocialLinks,
  deleteSocialLink,
  updateSocialLink,
} from "@/actions/social-link.actions";
import { SocialLinkForm } from "./social-link-form";
import { getPlatformName, getPlatformIcon, SOCIAL_PLATFORMS } from "@/lib/constants/social-platforms";
import type { SocialLink } from "@/lib/db/schema";

interface SocialLinksManagerProps {
  initialLinks: SocialLink[];
}

export function SocialLinksManager({ initialLinks }: SocialLinksManagerProps) {
  const [links, setLinks] = useState(initialLinks);
  const [editLink, setEditLink] = useState<SocialLink | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const existingPlatforms = links.map((l) => l.platform);

  const refreshLinks = async () => {
    const updated = await getSocialLinks();
    setLinks(updated);
  };

  const handleToggleEnabled = async (link: SocialLink) => {
    startTransition(async () => {
      try {
        await updateSocialLink(link.id, { enabled: !link.enabled });
        toast.success(link.enabled ? "Link disabled" : "Link enabled");
        refreshLinks();
      } catch {
        toast.error("Failed to update link");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        const result = await deleteSocialLink(deleteId);
        if (result.success) {
          toast.success("Link deleted");
          refreshLinks();
        }
      } catch {
        toast.error("Failed to delete link");
      } finally {
        setDeleteId(null);
      }
    });
  };

  const allPlatformsUsed = existingPlatforms.length >= SOCIAL_PLATFORMS.length;

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditLink(undefined);
            setIsFormOpen(true);
          }}
          disabled={allPlatformsUsed}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Link
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">No social media links yet</p>
          <Button
            variant="outline"
            onClick={() => {
              setEditLink(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add your first link
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="w-24">Enabled</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <Image
                      src={getPlatformIcon(link.platform)}
                      alt={link.platform}
                      width={24}
                      height={24}
                      className="shrink-0"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {getPlatformName(link.platform)}
                  </TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 max-w-xs truncate"
                    >
                      {link.url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={link.enabled}
                      onCheckedChange={() => handleToggleEnabled(link)}
                      disabled={isPending}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditLink(link);
                          setIsFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(link.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <SocialLinkForm
        link={editLink}
        existingPlatforms={existingPlatforms}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={refreshLinks}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this social media link? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
