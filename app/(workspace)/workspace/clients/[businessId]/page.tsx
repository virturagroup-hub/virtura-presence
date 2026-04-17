import Link from "next/link";
import { notFound } from "next/navigation";

import { LifecycleStatusForm } from "@/components/workspace/lifecycle-status-form";
import { ScoreProgress } from "@/components/portal/score-progress";
import { ServicePlanCard } from "@/components/shared/service-plan-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkspaceEmailActions } from "@/components/workspace/workspace-email-actions";
import { Button } from "@/components/ui/button";
import { getWorkspaceBusinessDetail } from "@/lib/data/workspace";
import { formatDate, formatDateTime } from "@/lib/dates";
import {
  auditScopeLabel,
  businessLifecycleLabel,
  comprehensiveRequestStatusLabel,
  implementationRecommendationLabel,
  scoreTierLabel,
  submissionStatusLabel,
} from "@/lib/display";
import { asStringArray } from "@/lib/text";
import { resolveServicePlanDefinition } from "@/lib/plan-catalog";
import { getEmailDeliverySummary } from "@/lib/email/config";

type WorkspaceClientDetailPageProps = {
  params: Promise<{
    businessId: string;
  }>;
};

export default async function WorkspaceClientDetailPage({
  params,
}: WorkspaceClientDetailPageProps) {
  const { businessId } = await params;
  const detail = await getWorkspaceBusinessDetail(businessId);

  if (!detail) {
    notFound();
  }

  const { business, latestSubmission, latestAudit, latestPublishedAudit, scoreTrend } = detail;
  const latestSubmissionId = latestSubmission?.id ?? null;
  const emailDeliverySummary = getEmailDeliverySummary();
  const visibleRecommendations =
    latestAudit?.planRecommendations.length
      ? latestAudit.planRecommendations
      : business.planRecommendations.slice(0, 4);

  return (
    <div className="space-y-7">
      <div className="surface-card p-6 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="section-kicker">Client detail</p>
            <h2 className="mt-4 font-heading text-4xl font-semibold text-slate-950">
              {business.name}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StatusBadge value={businessLifecycleLabel(business.lifecycleStage) ?? "Lead"} />
              <StatusBadge value={submissionStatusLabel(business.status)} />
              {latestAudit?.scope ? (
                <StatusBadge value={auditScopeLabel(latestAudit.scope) ?? "Audit"} />
              ) : null}
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              {business.description ??
                latestSubmission?.summary ??
                "Company profile, submission history, audit work, and follow-up context all live here now."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link
                href={
                  latestSubmissionId
                    ? `/workspace/audit-studio?businessId=${business.id}&submissionId=${latestSubmissionId}`
                    : `/workspace/audit-studio?businessId=${business.id}`
                }
              >
                Open Audit Studio
              </Link>
            </Button>
            <Button asChild className="rounded-full px-5">
              <Link href="/workspace">Back to pipeline</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="surface-card p-6">
            <p className="section-kicker">Business profile</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Owner / contact", business.ownerName ?? "Not added"],
                ["Primary email", business.primaryEmail],
                ["Phone", business.primaryPhone ?? "Not added"],
                ["Category", business.businessCategory],
                ["Location", `${business.city}, ${business.state}`],
                ["Service area", business.serviceArea ?? "Not added"],
                ["Website", business.websiteUrl ?? "Not added"],
                ["Google Business Profile", business.googleBusinessProfileUrl ?? "Not added"],
                [
                  "Reviews",
                  business.reviewCount
                    ? `${business.reviewCount} reviews${business.averageRating ? ` · ${business.averageRating.toFixed(1)} average` : ""}`
                    : "No review data yet",
                ],
                ["Goals", asStringArray(business.goals).join(", ") || "No goals listed"],
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
          </div>

          {scoreTrend.length ? <ScoreProgress trend={scoreTrend} /> : null}

          <div className="surface-card p-6">
            <p className="section-kicker">Submission history</p>
            <div className="mt-5 grid gap-4">
              {business.presenceChecks.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-[24px] border border-slate-200/70 bg-white/88 px-4 py-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold text-slate-950">
                          {formatDate(submission.submittedAt)}
                        </p>
                        <StatusBadge value={submissionStatusLabel(submission.status)} />
                        {submission.comprehensiveRequests[0] ? (
                          <StatusBadge
                            value={
                              comprehensiveRequestStatusLabel(
                                submission.comprehensiveRequests[0].status,
                              ) ?? "Requested"
                            }
                          />
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Score {submission.score ?? "--"}
                        {submission.scoreTier ? ` · ${scoreTierLabel(submission.scoreTier)}` : ""}
                      </p>
                    </div>
                    <Button asChild variant="ghost" className="rounded-full px-4">
                      <Link
                        href={`/workspace/audit-studio?businessId=${business.id}&submissionId=${submission.id}`}
                      >
                        Open this check
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <p className="section-kicker">Lifecycle management</p>
            <h3 className="mt-4 font-heading text-2xl font-semibold text-slate-950">
              Keep the company stage accurate as the relationship evolves
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              This stage powers the pipeline view, the Audit Studio queue, and the next-step context for consultants.
            </p>
            <div className="mt-5">
              <LifecycleStatusForm
                businessId={business.id}
                currentStage={business.lifecycleStage}
              />
            </div>
          </div>

          <WorkspaceEmailActions
            businessId={business.id}
            submissionId={latestSubmissionId}
            deliverySummary={emailDeliverySummary}
            hasAudit={Boolean(latestAudit)}
            hasComprehensiveAudit={latestAudit?.scope === "COMPREHENSIVE"}
          />

          {latestAudit ? (
            <div className="surface-card p-6">
              <p className="section-kicker">Latest audit</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <StatusBadge value={latestAudit.status.replaceAll("_", " ")} />
                {latestAudit.scope ? (
                  <StatusBadge value={auditScopeLabel(latestAudit.scope) ?? "Audit"} />
                ) : null}
              </div>
              <h3 className="mt-4 font-heading text-2xl font-semibold text-slate-950">
                {latestAudit.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {latestAudit.clientSummary ??
                  latestAudit.executiveSummary ??
                  "No published summary yet."}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-slate-200/70 bg-white/88 px-4 py-4">
                  <p className="text-xs text-slate-500">Progress</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {latestAudit.progressPercent}%
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200/70 bg-white/88 px-4 py-4">
                  <p className="text-xs text-slate-500">Implementation recommendation</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {implementationRecommendationLabel(
                      latestAudit.implementationRecommendation,
                    ) ?? "Consultation first"}
                  </p>
                </div>
              </div>
              {latestPublishedAudit?.publishedAt ? (
                <p className="mt-4 text-xs text-slate-500">
                  Published {formatDateTime(latestPublishedAudit.publishedAt)}
                </p>
              ) : null}
            </div>
          ) : null}

          {visibleRecommendations.length ? (
            <div className="grid gap-5">
              {visibleRecommendations.map((recommendation) => (
                <ServicePlanCard
                  key={recommendation.id}
                  plan={resolveServicePlanDefinition({
                    slug: recommendation.servicePlan.slug,
                  })}
                  mode="dashboard"
                  submissionId={latestSubmissionId ?? undefined}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card p-6">
          <p className="section-kicker">Comprehensive requests</p>
          <div className="mt-5 grid gap-4">
            {business.comprehensiveRequests.length ? (
              business.comprehensiveRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-[24px] border border-slate-200/70 bg-white/88 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge
                      value={
                        comprehensiveRequestStatusLabel(request.status) ?? "Requested"
                      }
                    />
                    <p className="text-xs text-slate-500">
                      {formatDateTime(request.createdAt)}
                    </p>
                  </div>
                  {request.note ? (
                    <p className="mt-3 text-sm leading-7 text-slate-700">{request.note}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">
                No comprehensive request has been submitted yet.
              </p>
            )}
          </div>
        </div>

        <div className="surface-card p-6">
          <p className="section-kicker">Internal notes</p>
          <div className="mt-5 grid gap-4">
            {business.internalNotes.length ? (
              business.internalNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-[24px] border border-slate-200/70 bg-white/88 px-4 py-4"
                >
                  <p className="text-sm font-semibold text-slate-950">
                    {note.title ?? "Internal note"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {note.author?.name ?? "Consultant"} · {formatDateTime(note.createdAt)}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{note.body}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">
                No internal notes have been saved for this company yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
