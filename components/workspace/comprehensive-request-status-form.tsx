"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ComprehensiveReportRequestStatus } from "@prisma/client";
import { toast } from "sonner";

import { updateComprehensiveRequestStatusAction } from "@/lib/actions/workspace";

type ComprehensiveRequestStatusFormProps = {
  requestId: string;
  currentStatus: ComprehensiveReportRequestStatus;
};

export function ComprehensiveRequestStatusForm({
  requestId,
  currentStatus,
}: ComprehensiveRequestStatusFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const nextStatus = formData.get("status");

        if (typeof nextStatus !== "string") {
          return;
        }

        startTransition(async () => {
          const response = await updateComprehensiveRequestStatusAction({
            requestId,
            status: nextStatus as ComprehensiveReportRequestStatus,
          });

          if (!response.success) {
            toast.error(response.error);
            return;
          }

          toast.success("Comprehensive report request updated.");
          router.refresh();
        });
      }}
      className="rounded-[24px] border border-slate-200/70 bg-white/88 p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
            Request status
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Track whether the client&apos;s deeper-audit request is still waiting,
            active, or resolved.
          </p>
        </div>
        <div className="flex gap-3">
          <select
            name="status"
            defaultValue={currentStatus}
            className="h-11 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
          >
            <option value="REQUESTED">Requested</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DECLINED">Declined</option>
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Saving..." : "Update"}
          </button>
        </div>
      </div>
    </form>
  );
}
