"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";

import { ScorePanel } from "@/components/shared/score-panel";
import { ServicePlanCard } from "@/components/shared/service-plan-card";
import { Button } from "@/components/ui/button";
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
};

export function PresenceCheckResults() {
  const [preview] = useState<StoredPreview | null>(() => {
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
            to open your portal if you already claimed access.
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

  const result = preview.result;
  const email = preview.input.email;
  const recommendedPlans = servicePlans.filter((plan) =>
    result.suggestedPlanSlugs.includes(plan.slug),
  );
  const primaryAction =
    preview.nextStep === "portal"
      ? { href: "/portal", label: "Go to my portal" }
      : preview.nextStep === "sign-in"
        ? { href: "/sign-in?callbackUrl=%2Fportal", label: "Sign in to view my portal" }
        : preview.claimToken
          ? { href: `/claim/${preview.claimToken}`, label: "Create my client account" }
          : { href: "/sign-in?callbackUrl=%2Fportal", label: "Create or access my portal" };

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

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-card space-y-5 p-6">
          <span className="section-kicker">Report delivery</span>
          <h2 className="font-heading text-3xl font-semibold text-slate-950">
            Your quick review is ready and your deeper report path is set up.
          </h2>
          <p className="text-sm leading-7 text-slate-600">
            The full report workflow is designed to continue through the client portal,
            where you can review published findings and next-step recommendations once a
            consultant review is complete.
          </p>
          <div className="rounded-3xl border border-brand-100 bg-brand-50/80 px-5 py-4 text-sm text-brand-800">
            Report destination: <span className="font-semibold">{email}</span>
          </div>
          {preview.submissionId ? (
            <p className="text-xs font-medium tracking-[0.16em] text-slate-500 uppercase">
              Submission ID: {preview.submissionId}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-5">
              <Link href={primaryAction.href}>{primaryAction.label}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/presence-check">
                <RefreshCcw className="size-4" />
                Start over
              </Link>
            </Button>
          </div>
        </div>

        <div className="surface-card p-6">
          <span className="section-kicker">Suggested next steps</span>
          <div className="mt-5 grid gap-5">
            {recommendedPlans.map((plan) => (
              <ServicePlanCard key={plan.slug} plan={plan} mode="dashboard" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
