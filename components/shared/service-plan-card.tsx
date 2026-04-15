import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ServicePlanDefinition } from "@/lib/plan-catalog";

type ServicePlanCardProps = {
  plan: ServicePlanDefinition;
  mode?: "marketing" | "dashboard";
};

export function ServicePlanCard({
  plan,
  mode = "marketing",
}: ServicePlanCardProps) {
  return (
    <article className="surface-card relative flex h-full flex-col overflow-hidden p-6">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${plan.accentColor}`}
      />
      <div className="space-y-4">
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
        <p className="rounded-2xl border border-slate-200/70 bg-slate-50/90 px-4 py-3 text-sm text-slate-600">
          {plan.summary}
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Ideal for
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{plan.idealFor}</p>
        </div>

        <div className="grid gap-3">
          {plan.deliverables.map((deliverable) => (
            <div
              key={deliverable}
              className="rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-slate-700"
            >
              {deliverable}
            </div>
          ))}
        </div>
      </div>

      {mode === "marketing" ? (
        <Button asChild className="mt-6 self-start rounded-full px-5">
          <Link href="/presence-check">
            Start with the free check
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ) : null}
    </article>
  );
}
