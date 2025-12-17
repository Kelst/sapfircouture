"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { markContactRequestProcessed } from "@/actions/contact.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MarkProcessedButtonProps {
  requestId: string;
}

export function MarkProcessedButton({ requestId }: MarkProcessedButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setIsLoading(true);
    try {
      await markContactRequestProcessed(requestId);
      toast.success("Marked as processed");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Check className="h-4 w-4 mr-1" />
          Mark Done
        </>
      )}
    </Button>
  );
}
