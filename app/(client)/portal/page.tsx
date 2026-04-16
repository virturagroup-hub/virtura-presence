import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";

import { ComprehensiveReportRequestDialog } from "@/components/shared/comprehensive-report-request-dialog";
import { ScorePanel } from "@/components/shared/score-panel";
import { ServicePlanCard } from "@/components/shared/service-plan-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ScoreProgress } from "@/components/portal/score-progress";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import { categoryLabelFromKey, followUpStatusLabels, scoreTierLabel } from "@/lib/display";
import { getCurrentUser } from "@/lib/auth";
import { getPortalDashboardData } from "@/lib/data/portal";
import { resolveServicePlanDefinition } from "@/lib/plan-catalog";
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
          presence check or create portal access with the same email you used when the
          business was submitted.
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
  const latestBusiness = portal.latestBusiness;
  const latestFollowUp = latest.followUps[0] ?? null;
  const latestRequest = latest.comprehensiveRequests[0] ?? latest.business.comprehensiveRequests[0] ?? null;
  const latestRequestLabel = latestRequest?.status.replaceAll("_", " ").toLowerCase() ?? null;
  const recommendedPlans =
    latest.audit?.planRecommendations.length
      ? latest.audit.planRecommendations
      : latest.planRecommendations;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
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

        <div className="space-y-5">
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
            <div className="mt-5 grid gap-3">
              <div className="rounded-3xl border border-slate-200/70 bg-slate-50/85 p-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  Published audit
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  {latest.audit?.status === "PUBLISHED"
                    ? "A consultant-reviewed audit is live in your portal."
                    : "The consultant review is still in progress. Your quick assessment remains available here in the meantime."}
                </p>
              </div>
              <div className="rounded-3xl border border-brand-100 bg-brand-50/80 p-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-brand-700 uppercase">
                  Follow-up status
                </p>
                <p className="mt-2 text-sm text-brand-800">
                  {latestFollowUp
                    ? followUpStatusLabels[latestFollowUp.status]
                    : "No follow-up has been sent yet."}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  Comprehensive report
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {latestRequest
                    ? `Request status: ${latestRequest.status.replaceAll("_", " ").toLowerCase()}.`
                    : "No comprehensive report has been requested yet."}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full px-5">
                <Link href="/portal/report">
                  View published report
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <ComprehensiveReportRequestDialog
                submissionId={latest.id}
                existingStatus={latestRequestLabel}
                className="rounded-full px-5"
              />
            </div>
          </div>

          {latestBusiness ? (
            <div className="surface-card p-6">
              <div className="flex items-center gap-3">
                <Inbox className="size-5 text-brand-600" />
                <p className="text-sm font-semibold text-slate-950">Presence profile snapshot</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Contact email", latestBusiness.primaryEmail],
                  ["Phone", latestBusiness.primaryPhone ?? "Not provided"],
                  ["Website", latestBusiness.websiteUrl ?? "Not listed"],
                  [
                    "Google profile",
                    latestBusiness.googleBusinessProfileUrl ?? "Not listed",
                  ],
                  [
                    "Review base",
                    latestBusiness.reviewCount
                      ? `${latestBusiness.reviewCount} reviews${latestBusiness.averageRating ? ` · ${latestBusiness.averageRating.toFixed(1)} avg` : ""}`
                      : "No review data saved yet",
                  ],
                  ["Service area", latestBusiness.serviceArea ?? "Not provided"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[24px] border border-slate-200/70 bg-white/88 px-4 py-4"
                  >
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-2 text-sm font-medium leading-7 text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="mt-5 rounded-full px-5">
                <Link href="/portal/profile">Edit company profile</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <ScoreProgress trend={portal.trend} />

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
                plan={resolveServicePlanDefinition({
                  slug: plan.servicePlan.slug,
                  name: plan.servicePlan.name,
                  accentColor: plan.servicePlan.accentColor ?? "from-brand-500/20 to-cyan-300/20",
                  featured: plan.servicePlan.featured,
                })}
                mode="dashboard"
                submissionId={latest.id}
                requestStatusLabel={latestRequestLabel}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
