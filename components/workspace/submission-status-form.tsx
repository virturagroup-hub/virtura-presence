"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SubmissionStatus } from "@prisma/client";
import { toast } from "sonner";

import { updateSubmissionStatusAction } from "@/lib/actions/workspace";
import { submissionStatusLabels } from "@/lib/display";

type SubmissionStatusFormProps = {
  submissionId: string;
  currentStatus: SubmissionStatus;
};

export function SubmissionStatusForm({
  submissionId,
  currentStatus,
}: SubmissionStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-5">
      <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
        Workflow status
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as SubmissionStatus)}
          className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
        >
          {Object.entries(submissionStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const response = await updateSubmissionStatusAction({
                submissionId,
                status,
              });

              if (!response.success) {
                toast.error(response.error);
                return;
              }

              toast.success("Workflow status updated.");
              router.refresh();
            })
          }
          className="inline-flex h-12 items-center justify-center rounded-full bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Saving..." : "Update status"}
        </button>
      </div>
    </div>
  );
}
