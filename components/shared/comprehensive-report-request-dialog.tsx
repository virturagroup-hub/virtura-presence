"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { requestComprehensiveReportAction } from "@/lib/actions/portal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type ComprehensiveReportRequestDialogProps = {
  submissionId: string;
  triggerLabel?: string;
  className?: string;
  existingStatus?: string | null;
};

export function ComprehensiveReportRequestDialog({
  submissionId,
  triggerLabel = "Request comprehensive report",
  className,
  existingStatus,
}: ComprehensiveReportRequestDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className ?? "rounded-full px-5"} variant="outline">
          {existingStatus ? `Request status: ${existingStatus}` : triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-[28px] border border-white/70 bg-white/92 p-0 backdrop-blur-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Request a comprehensive report</DialogTitle>
          <DialogDescription>
            This request creates a real follow-up item for the consultant workspace.
            It does not auto-purchase anything, and it keeps the deeper audit
            explicit instead of assumed.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <Textarea
            rows={6}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="rounded-3xl"
            placeholder="Optional note about what you want the comprehensive report to focus on."
          />
        </div>
        <DialogFooter className="rounded-b-[28px] border-t border-slate-200/70 bg-slate-50/80 px-6 py-4">
          <Button
            type="button"
            onClick={() => {
              startTransition(async () => {
                const response = await requestComprehensiveReportAction({
                  submissionId,
                  note,
                });

                if (!response.success) {
                  toast.error(response.error);
                  return;
                }

                toast.success("Comprehensive report request saved.");
                setOpen(false);
                setNote("");
                router.refresh();
              });
            }}
            disabled={isPending}
            className="rounded-full px-5"
          >
            {isPending ? "Saving request..." : "Save request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
