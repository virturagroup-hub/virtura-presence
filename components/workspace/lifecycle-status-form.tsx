"use client";

import { useTransition } from "react";
import { BusinessLifecycleStage } from "@prisma/client";
import { toast } from "sonner";

import { updateBusinessLifecycleAction } from "@/lib/actions/workspace";
import { businessLifecycleLabels } from "@/lib/display";

type LifecycleStatusFormProps = {
  businessId: string;
  currentStage: BusinessLifecycleStage;
};

export function LifecycleStatusForm({
  businessId,
  currentStage,
}: LifecycleStatusFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        const lifecycleStage = String(
          formData.get("lifecycleStage") ?? currentStage,
        ) as BusinessLifecycleStage;

        startTransition(async () => {
          const response = await updateBusinessLifecycleAction({
            businessId,
            lifecycleStage,
          });

          if (!response.success) {
            toast.error(response.error);
            return;
          }

          toast.success("Company lifecycle updated.");
        });
      }}
      className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
    >
      <select
        name="lifecycleStage"
        defaultValue={currentStage}
        className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
      >
        {Object.entries(businessLifecycleLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Saving..." : "Update lifecycle"}
      </button>
    </form>
  );
}
