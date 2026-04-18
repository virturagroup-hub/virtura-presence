import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";

import { ServicePlanDetailDialog } from "@/components/shared/service-plan-detail-dialog";
import { Button } from "@/components/ui/button";
import { buildServicePlanInquiryHref, type ServicePlanDefinition } from "@/lib/plan-catalog";

type ServicePlanCardProps = {
  plan: ServicePlanDefinition;
  mode?: "marketing" | "dashboard";
  submissionId?: string;
  requestStatusLabel?: string | null;
};

export function ServicePlanCard({
  plan,
  mode = "marketing",
  submissionId,
  requestStatusLabel,
}: ServicePlanCardProps) {
  const inquiryHref = buildServicePlanInquiryHref(plan.name);

  return (
    <article className="surface-card relative flex h-full flex-col overflow-hidden p-6 sm:p-7">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${plan.accentColor}`}
      />
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
              {plan.tierLabel}
            </p>
            <h3 className="mt-3 font-heading text-2xl font-semibold text-slate-950">
              {plan.name}
            </h3>
          </div>
          {plan.featured ? (
            <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-brand-700 uppercase">
              Featured
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-7 text-slate-600">{plan.tagline}</p>
        <p className="rounded-[24px] border border-slate-200/70 bg-slate-50/75 px-4 py-3 text-sm leading-7 text-slate-600">
          {plan.summary}
        </p>
        <div className="mt-auto flex min-h-[128px] flex-col justify-between rounded-[26px] border border-brand-100/80 bg-brand-50/65 px-5 py-4">
          <p className="text-xs font-semibold tracking-[0.22em] text-brand-700 uppercase">
            Public pricing
          </p>
          <p className="mt-3 font-heading text-3xl font-semibold tracking-tight text-slate-950">
            {plan.quickPrice}
          </p>
          <p className="mt-2 text-sm leading-7 text-brand-800">{plan.quickPriceNote}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {mode === "marketing" ? (
          <Button asChild className="rounded-full px-5">
            <Link href="/presence-check">
              Start with the free check
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="rounded-full px-5">
            <a href={inquiryHref}>
              Talk through this service
              <MessageSquareText className="size-4" />
            </a>
          </Button>
        )}

        <ServicePlanDetailDialog
          plan={plan}
          mode={mode}
          submissionId={submissionId}
          requestStatusLabel={requestStatusLabel}
          triggerClassName="rounded-full px-5"
          triggerVariant={mode === "marketing" ? "outline" : "default"}
        />
      </div>
    </article>
  );
}
