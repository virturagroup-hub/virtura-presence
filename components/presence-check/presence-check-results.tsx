"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { RefreshCcw, Send } from "lucide-react";
import { toast } from "sonner";

import { sendPresenceCheckReportAction } from "@/lib/actions/presence-check";
import { ScorePanel } from "@/components/shared/score-panel";
import { ServicePlanCard } from "@/components/shared/service-plan-card";
import { ComprehensiveReportRequestDialog } from "@/components/shared/comprehensive-report-request-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { servicePlans } from "@/lib/plan-catalog";
import type { QuickScoreResult } from "@/lib/presence/score";
import type { PresenceCheckInput } from "@/lib/validations/presence-check";

const storageKey = "virtura-presence-preview";

type StoredPreview = {
  submittedAt: string;
  input: PresenceCheckInput;
  result: QuickScoreResult;
  submissionId?: string;
  nextStep?: "portal" | "sign-in" | "claim";
  claimToken?: string;
  reportEmail?: string;
  deliverySent?: boolean;
};

export function PresenceCheckResults() {
  const [preview, setPreview] = useState<StoredPreview | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.sessionStorage.getItem(storageKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredPreview;
    } catch {
      return null;
    }
  });
  const [reportEmail, setReportEmail] = useState<string>(
    preview?.reportEmail ?? preview?.input.email ?? "",
  );
  const [isPending, startTransition] = useTransition();

  const primaryAction = useMemo(() => {
    if (!preview?.deliverySent) {
      return null;
    }

    if (preview.nextStep === "portal") {
      return { href: "/portal", label: "Go to my portal" };
    }

    if (preview.nextStep === "sign-in") {
      return {
        href: `/sign-in?callbackUrl=${encodeURIComponent("/portal")}&email=${encodeURIComponent(reportEmail)}`,
        label: "Sign in to view my portal",
      };
    }

    if (preview.claimToken) {
      return {
        href: `/claim/${preview.claimToken}`,
        label: "Create account to view my portal",
      };
    }

    return {
      href: `/sign-in?callbackUrl=${encodeURIComponent("/portal")}&email=${encodeURIComponent(reportEmail)}`,
      label: "Create account to view my portal",
    };
  }, [preview, reportEmail]);

  if (!preview) {
    return (
      <div className="space-y-6">
        <div className="surface-card p-6 sm:p-8">
          <span className="section-kicker">Quick score session</span>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
            This quick score preview is no longer stored in the browser.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            The submission itself may still be saved, but this temporary preview
            session has expired or was cleared. Start a new presence check or sign in
            if you already created portal access.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-5">
              <Link href="/presence-check">
                <RefreshCcw className="size-4" />
                Start a new presence check
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/sign-in?callbackUrl=%2Fportal">Sign in to my portal</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activePreview = preview;
  const result = activePreview.result;
  const recommendedPlans = servicePlans.filter((plan) =>
    result.suggestedPlanSlugs.includes(plan.slug),
  );

  function persistPreview(nextPreview: StoredPreview) {
    setPreview(nextPreview);
    window.sessionStorage.setItem(storageKey, JSON.stringify(nextPreview));
  }

  function handleSendReport() {
    if (!activePreview.submissionId) {
      toast.error("This submission no longer has a database record attached to it.");
      return;
    }

    startTransition(async () => {
      const response = await sendPresenceCheckReportAction({
        submissionId: activePreview.submissionId!,
        reportEmail,
      });

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      const nextPreview = {
        ...activePreview,
        reportEmail: response.result.reportEmail,
        deliverySent: true,
        nextStep: response.result.nextStep,
        claimToken: response.result.claimToken,
      } satisfies StoredPreview;

      persistPreview(nextPreview);
      toast.success("Your free report has been sent.");
    });
  }

  return (
    <div className="space-y-8">
      <ScorePanel
        score={result.score}
        tier={result.tier}
        summary={result.summary}
        encouragement={result.encouragement}
        strengths={result.strengths}
        improvements={result.improvements}
        categories={result.categories}
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="surface-card space-y-5 p-6">
          <span className="section-kicker">Free report delivery</span>
          <h2 className="font-heading text-3xl font-semibold text-slate-950">
            Choose where the free report should go, then decide whether you want portal access.
          </h2>
          <p className="text-sm leading-7 text-slate-600">
            The quick score is ready now. Sending the free report keeps the record tied
            to the right inbox and sets up the correct next step for portal access.
          </p>

          <div className="rounded-[28px] border border-brand-100 bg-brand-50/70 p-5">
            <p className="text-xs font-semibold tracking-[0.22em] text-brand-700 uppercase">
              Report destination
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Input
                value={reportEmail}
                onChange={(event) => setReportEmail(event.target.value)}
                type="email"
                className="h-12 rounded-2xl border-brand-100 bg-white/95"
              />
              <Button
                type="button"
                onClick={handleSendReport}
                className="h-12 rounded-full px-5"
                disabled={isPending}
              >
                <Send className="size-4" />
                {isPending ? "Sending..." : "Send my free report"}
              </Button>
            </div>
            <p className="mt-3 text-sm text-brand-800">
              {activePreview.deliverySent
                ? `Free report sent to ${activePreview.reportEmail ?? reportEmail}.`
                : "You can edit this email before sending if the report should go somewhere else."}
            </p>
          </div>

          {activePreview.submissionId ? (
            <p className="text-xs font-medium tracking-[0.16em] text-slate-500 uppercase">
              Submission ID: {activePreview.submissionId}
            </p>
          ) : null}

          <div className="flex flex-col gap-3">
            {primaryAction ? (
              <Button asChild className="rounded-full px-5 sm:self-start">
                <Link href={primaryAction.href}>{primaryAction.label}</Link>
              </Button>
            ) : (
              <div className="rounded-3xl border border-slate-200/70 bg-slate-50/85 px-4 py-3 text-sm text-slate-600">
                Send the free report first, then the correct portal action will appear here.
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              {activePreview.submissionId ? (
                <ComprehensiveReportRequestDialog
                  submissionId={activePreview.submissionId}
                  className="rounded-full px-5"
                />
              ) : null}
              <Button asChild variant="outline" className="rounded-full px-5">
                <Link href="/presence-check">
                  <RefreshCcw className="size-4" />
                  Start over
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <span className="section-kicker">Suggested next steps</span>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              These recommendations are suggestions, not automatic requests. If you
              want the deeper consultant review, request it explicitly.
            </p>
            <div className="mt-5 grid gap-5">
              {recommendedPlans.map((plan) => (
                <ServicePlanCard key={plan.slug} plan={plan} mode="dashboard" />
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <span className="section-kicker">Transparent starting pricing</span>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Virtura Presence still starts with a free check, but pricing should not
              feel hidden once you are evaluating next steps.
            </p>
            <div className="mt-4 grid gap-3">
              {recommendedPlans.map((plan) => (
                <div
                  key={`${plan.slug}-price`}
                  className="rounded-[24px] border border-slate-200/70 bg-white/88 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{plan.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{plan.pricingLabel}</p>
                    </div>
                    <p className="text-sm font-semibold text-brand-700">{plan.priceFrom}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
