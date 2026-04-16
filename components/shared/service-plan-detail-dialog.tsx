"use client";

import Link from "next/link";
import { ArrowRight, CircleDollarSign, Mail, ShieldCheck, Sparkles } from "lucide-react";

import { ComprehensiveReportRequestDialog } from "@/components/shared/comprehensive-report-request-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buildServicePlanInquiryHref, type ServicePlanDefinition } from "@/lib/plan-catalog";

type ServicePlanDetailDialogProps = {
  plan: ServicePlanDefinition;
  mode?: "marketing" | "dashboard";
  submissionId?: string;
  requestStatusLabel?: string | null;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerVariant?: "default" | "outline" | "secondary";
};

export function ServicePlanDetailDialog({
  plan,
  mode = "marketing",
  submissionId,
  requestStatusLabel,
  triggerLabel = "View full details",
  triggerClassName,
  triggerVariant = "outline",
}: ServicePlanDetailDialogProps) {
  const inquiryHref = buildServicePlanInquiryHref(plan.name);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className={triggerClassName}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[30px] border border-white/70 bg-white/95 p-0 backdrop-blur-2xl sm:max-w-4xl">
        <div className="relative h-full overflow-y-auto">
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${plan.accentColor}`} />

          <div className="px-6 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-8">
            <DialogHeader className="gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="section-kicker">{plan.tierLabel}</span>
                {plan.featured ? (
                  <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-brand-700 uppercase">
                    Featured
                  </span>
                ) : null}
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <DialogTitle className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
                    {plan.name}
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-7 text-slate-600 sm:text-base">
                    {plan.summary}
                  </DialogDescription>
                  <div className="rounded-[28px] border border-brand-100 bg-brand-50/80 p-5">
                    <p className="text-xs font-semibold tracking-[0.22em] text-brand-700 uppercase">
                      Public pricing
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="font-heading text-4xl font-semibold tracking-tight text-slate-950">
                          {plan.quickPrice}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-brand-800">
                          {plan.quickPriceNote}
                        </p>
                      </div>
                      <CircleDollarSign className="size-8 text-brand-600" />
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-5">
                  <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                    Ideal for
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{plan.idealFor}</p>
                  <div className="mt-5">
                    <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                      What it helps improve
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {plan.outcomes.map((outcome) => (
                        <span
                          key={outcome}
                          className="rounded-full border border-white/80 bg-white/92 px-3 py-2 text-xs font-medium text-slate-700 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.45)]"
                        >
                          {outcome}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-8 grid gap-5 lg:grid-cols-[0.98fr_1.02fr]">
              <section className="surface-card p-6">
                <div className="flex items-center gap-3">
                  <CircleDollarSign className="size-5 text-brand-600" />
                  <div>
                    <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                      Pricing details
                    </p>
                    <h3 className="mt-1 font-heading text-2xl font-semibold text-slate-950">
                      Clear public pricing with realistic scope notes
                    </h3>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {plan.pricingDetails.map((detail) => (
                    <div
                      key={detail}
                      className="rounded-[24px] border border-slate-200/70 bg-white/92 px-4 py-4 text-sm leading-7 text-slate-700"
                    >
                      {detail}
                    </div>
                  ))}
                </div>
              </section>

              <section className="surface-card p-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="size-5 text-brand-600" />
                  <div>
                    <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                      What&apos;s included
                    </p>
                    <h3 className="mt-1 font-heading text-2xl font-semibold text-slate-950">
                      Focused scope, not padded extras
                    </h3>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {plan.deliverables.map((deliverable) => (
                    <div
                      key={deliverable}
                      className="rounded-[24px] border border-slate-200/70 bg-white/92 px-4 py-4 text-sm leading-7 text-slate-700"
                    >
                      {deliverable}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="mt-5 surface-card p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-brand-600" />
                <div>
                  <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                    Scope notes
                  </p>
                  <h3 className="mt-1 font-heading text-2xl font-semibold text-slate-950">
                    Straightforward expectations before anyone commits
                  </h3>
                </div>
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {plan.scopeNotes.map((note) => (
                  <div
                    key={note}
                    className="rounded-[24px] border border-slate-200/70 bg-white/92 px-4 py-4 text-sm leading-7 text-slate-700"
                  >
                    {note}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="border-t border-slate-200/70 bg-slate-50/85 px-6 py-4 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {mode === "marketing" ? (
                <Button asChild className="rounded-full px-5">
                  <Link href="/presence-check">
                    Start with the free check
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : submissionId ? (
                <ComprehensiveReportRequestDialog
                  submissionId={submissionId}
                  existingStatus={requestStatusLabel}
                  className="rounded-full px-5"
                />
              ) : null}

              <Button asChild variant={mode === "marketing" ? "outline" : "default"} className="rounded-full px-5">
                <a href={inquiryHref}>
                  Talk through this service
                  <Mail className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
