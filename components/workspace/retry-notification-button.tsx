"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { retryWorkspaceNotificationAction } from "@/lib/actions/workspace";
import { Button } from "@/components/ui/button";

export function RetryNotificationButton({
  eventId,
  disabled = false,
}: {
  eventId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full"
      disabled={isPending || disabled}
      onClick={() =>
        startTransition(async () => {
          const response = await retryWorkspaceNotificationAction({
            eventId,
          });

          if (!response.success) {
            toast.error(response.error);
            router.refresh();
            return;
          }

          toast.success(response.message ?? "Notification sent successfully.");
          router.refresh();
        })
      }
    >
      {disabled ? "Retry unavailable" : isPending ? "Retrying..." : "Retry send"}
      <RotateCcw className="size-3.5" />
    </Button>
  );
}
