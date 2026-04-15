import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";

import { ScorePanel } from "@/components/shared/score-panel";
import { ServicePlanCard } from "@/components/shared/service-plan-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import { categoryLabelFromKey, followUpStatusLabels, scoreTierLabel } from "@/lib/display";
import { getCurrentUser } from "@/lib/auth";
import { getPortalDashboardData } from "@/lib/data/portal";
import { asStringArray } from "@/lib/text";

export default async function PortalPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return null;
  }

  const portal = await getPortalDashboardData(user.id);

  if (!portal.latestSubmission) {
    return (
      <div className="surface-card p-8">
        <p className="section-kicker">Client portal</p>
        <h2 className="mt-4 font-heading text-4xl font-semibold text-slate-950">
          Your portal will populate as soon as a real presence check is submitted.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Right now there are no submissions linked to this account. Start a free
          presence check or sign in with the email that was used for a saved submission.
        </p>
        <Button asChild className="mt-6 rounded-full px-5">
          <Link href="/presence-check">
            Start free presence check
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const latest = portal.latestSubmission;
  const latestFollowUp = latest.followUps[0] ?? null;
  const recommendedPlans =
    latest.audit?.planRecommendations.length
      ? latest.audit.planRecommendations
      : latest.planRecommendations;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ScorePanel
          score={latest.score ?? 0}
          tier={scoreTierLabel(latest.scoreTier) ?? "Quick score pending"}
          summary={latest.summary ?? "Your quick assessment is being prepared."}
          encouragement={latest.encouragement ?? undefined}
          strengths={asStringArray(latest.strengths)}
          improvements={asStringArray(latest.improvementAreas)}
          categories={latest.categoryScores.map((category) => ({
            label: categoryLabelFromKey(category.category),
            score: category.score,
          }))}
        />

        <div className="space-y-6">
          <div className="surface-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  Current submission
                </p>
                <h2 className="mt-3 font-heading text-3xl font-semibold text-slate-950">
                  {latest.businessName}
                </h2>
              </div>
              <StatusBadge value={latest.status.replaceAll("_", " ")} />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Submitted {formatDate(latest.submittedAt)}
            </p>
            <div className="mt-6 rounded-3xl border border-slate-200/70 bg-slate-50/85 p-5">
              <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                Published audit
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {latest.audit?.status === "PUBLISHED"
                  ? "A consultant-reviewed audit is live in your portal."
                  : "The consultant review is still in progress. Your quick assessment remains available here in the meantime."}
              </p>
            </div>
            <div className="mt-4 rounded-3xl border border-brand-100 bg-brand-50/80 p-5">
              <p className="text-xs font-semibold tracking-[0.22em] text-brand-700 uppercase">
                Follow-up status
              </p>
              <p className="mt-3 text-sm text-brand-800">
                {latestFollowUp
                  ? followUpStatusLabels[latestFollowUp.status]
                  : "No follow-up has been sent yet."}
              </p>
            </div>
            <Button asChild className="mt-6 rounded-full px-5">
              <Link href="/portal/report">
                View published report
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center gap-3">
              <Inbox className="size-5 text-brand-600" />
              <p className="text-sm font-semibold text-slate-950">Submission history</p>
            </div>
            <div className="mt-4 space-y-3">
              {portal.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-[24px] border border-slate-200/70 bg-white/88 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {submission.businessName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(submission.submittedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-950">
                        {submission.score ?? "--"}
                      </p>
                      <p className="text-xs text-slate-500">Quick score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {recommendedPlans.length ? (
        <section className="space-y-5">
          <div>
            <p className="section-kicker">Recommended plan options</p>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
              Suggestions aligned to the visible gaps in your current audit.
            </h2>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {recommendedPlans.map((plan) => (
              <ServicePlanCard
                key={plan.id}
                plan={{
                  slug: plan.servicePlan.slug,
                  name: plan.servicePlan.name,
                  tagline: plan.servicePlan.tagline,
                  summary: plan.servicePlan.summary,
                  idealFor: plan.servicePlan.idealFor,
                  tierLabel: plan.servicePlan.tierLabel,
                  accentColor: plan.servicePlan.accentColor ?? "from-brand-500/20 to-cyan-300/20",
                  deliverables: asStringArray(plan.servicePlan.deliverables),
                  outcomes: asStringArray(plan.servicePlan.outcomes),
                  featured: plan.servicePlan.featured,
                }}
                mode="dashboard"
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
