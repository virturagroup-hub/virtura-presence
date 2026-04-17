import Link from "next/link";
import { notFound } from "next/navigation";

import { AuditCategory, AuditScope } from "@prisma/client";

import { AuditEditorForm } from "@/components/workspace/audit-editor-form";
import { ScorePanel } from "@/components/shared/score-panel";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkspaceEmailActions } from "@/components/workspace/workspace-email-actions";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getAuditStudioData } from "@/lib/data/workspace";
import { formatDate, formatDateTime } from "@/lib/dates";
import {
  auditScopeLabel,
  businessLifecycleLabel,
  categoryLabelFromKey,
  comprehensiveRequestStatusLabel,
  scoreTierLabel,
} from "@/lib/display";
import { canUnpublishAudit } from "@/lib/permissions";
import { asStringArray } from "@/lib/text";
import { buildDefaultChecklistItems } from "@/lib/workspace-audit";

type AuditStudioPageProps = {
  searchParams: Promise<{
    businessId?: string;
    submissionId?: string;
  }>;
};

export default async function AuditStudioPage({
  searchParams,
}: AuditStudioPageProps) {
  const parsed = await searchParams;
  const [studio, user] = await Promise.all([
    getAuditStudioData(parsed),
    getCurrentUser(),
  ]);

  if (!user?.id) {
    return null;
  }

  if (!studio.queue.length) {
    return (
      <div className="surface-card p-8 text-center">
        <h2 className="font-heading text-3xl font-semibold text-slate-950">
          Audit Studio is waiting for the next company.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Once new presence checks or comprehensive requests arrive, they will show up here as studio-ready client records.
        </p>
      </div>
    );
  }

  if (!studio.detail || !studio.selectedSubmission) {
    notFound();
  }

  const { business, draftAssist, availablePlans } = studio.detail;
  const submission = studio.selectedSubmission;
  const audit = submission.audit;
  const auditSections =
    audit?.sections.length
      ? audit.sections.map((section) => ({
          category: section.category as AuditCategory,
          score: section.score ?? 0,
          headline: section.headline,
          clientFacingNotes: section.clientFacingNotes,
          internalNotes: section.internalNotes ?? "",
        }))
      : submission.categoryScores.map((category) => ({
          category: category.category as AuditCategory,
          score: category.score,
          headline: categoryLabelFromKey(category.category),
          clientFacingNotes: category.note,
          internalNotes: "",
        }));
  const checklistItems =
    audit?.checklistItems.length
      ? audit.checklistItems.map((item) => ({
          category: item.category,
          title: item.title,
          status: item.status,
          notes: item.notes ?? "",
          recommendation: item.recommendation ?? "",
        }))
      : buildDefaultChecklistItems();
  const evidence =
    audit?.evidence.map((item) => ({
      category: item.category,
      label: item.label,
      assetUrl: item.assetUrl ?? "",
      notes: item.notes ?? "",
      stage: item.stage,
      clientVisible: item.clientVisible,
    })) ?? [];

  return (
    <div className="space-y-7">
      <div className="grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
        <div className="surface-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">Audit Studio queue</p>
              <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
                Choose a company to review
              </h2>
            </div>
            <p className="text-sm text-slate-500">{studio.queue.length} in studio</p>
          </div>

          <div className="mt-5 grid gap-4">
            {studio.queue.map((company) => {
              const selected = company.id === business.id;

              return (
                <Link
                  key={company.id}
                  href={
                    company.latestSubmissionId
                      ? `/workspace/audit-studio?businessId=${company.id}&submissionId=${company.latestSubmissionId}`
                      : `/workspace/audit-studio?businessId=${company.id}`
                  }
                  className={`rounded-[26px] border px-4 py-4 transition ${
                    selected
                      ? "border-brand-200 bg-brand-50/70 shadow-[0_24px_50px_-36px_rgba(47,111,228,0.45)]"
                      : "border-slate-200/70 bg-white/88 hover:border-brand-200"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold text-slate-950">{company.name}</p>
                    <StatusBadge
                      value={businessLifecycleLabel(company.lifecycleStage) ?? "Lead"}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Score {company.quickScore ?? "--"}
                    {company.quickTier ? ` · ${scoreTierLabel(company.quickTier)}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {company.primaryEmail} · {company.city}, {company.state}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Latest activity {formatDate(company.latestActivityAt) ?? "pending"}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6 sm:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="section-kicker">Selected company</p>
                <h2 className="mt-4 font-heading text-4xl font-semibold text-slate-950">
                  {business.name}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <StatusBadge value={businessLifecycleLabel(business.lifecycleStage) ?? "Lead"} />
                  {submission.audit?.scope ? (
                    <StatusBadge value={auditScopeLabel(submission.audit.scope) ?? "Audit"} />
                  ) : null}
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
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {business.description ??
                    submission.summary ??
                    "Use the Audit Studio to turn the quick presence data into a deeper consultant-ready report."}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="outline" className="rounded-full px-5">
                  <Link href={`/workspace/clients/${business.id}`}>Open company record</Link>
                </Button>
                <Button asChild className="rounded-full px-5">
                  <Link href="/workspace">Back to pipeline</Link>
                </Button>
              </div>
            </div>
          </div>

          <ScorePanel
            score={submission.score ?? 0}
            tier={scoreTierLabel(submission.scoreTier) ?? "Quick score"}
            summary={submission.summary ?? "Quick score not available yet."}
            encouragement={submission.encouragement ?? undefined}
            strengths={asStringArray(submission.strengths)}
            improvements={asStringArray(submission.improvementAreas)}
            categories={submission.categoryScores.map((category) => ({
              label: categoryLabelFromKey(category.category),
              score: category.score,
            }))}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="surface-card p-6">
            <p className="section-kicker">Client context</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Primary contact", business.ownerName ?? "Not added"],
                ["Email", business.primaryEmail],
                ["Phone", business.primaryPhone ?? "Not added"],
                ["Category", business.businessCategory],
                ["Service area", business.serviceArea ?? "Not added"],
                ["Last check", formatDate(submission.submittedAt) ?? "Pending"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[24px] border border-slate-200/70 bg-white/88 px-4 py-4"
                >
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <WorkspaceEmailActions
            businessId={business.id}
            submissionId={submission.id}
            latestEvents={submission.notificationEvents.map((event) => ({
              id: event.id,
              type: event.type,
              status: event.status,
              subject: event.subject,
              createdAt: event.createdAt,
              processedAt: event.processedAt,
            }))}
            hasAudit={Boolean(audit)}
            hasComprehensiveAudit={audit?.scope === AuditScope.COMPREHENSIVE}
          />

          {submission.comprehensiveRequests.length ? (
            <div className="surface-card p-6">
              <p className="section-kicker">Comprehensive request context</p>
              <div className="mt-5 grid gap-4">
                {submission.comprehensiveRequests.map((request) => (
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
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <AuditEditorForm
          submissionId={submission.id}
          status={audit?.status ?? "DRAFT"}
          scope={audit?.scope ?? (submission.comprehensiveRequests.length ? AuditScope.COMPREHENSIVE : AuditScope.FREE_REVIEW)}
          progressPercent={audit?.progressPercent ?? 10}
          implementationRecommendation={audit?.implementationRecommendation ?? "CONSULTATION"}
          implementationNotes={audit?.implementationNotes ?? ""}
          draftAssist={draftAssist}
          title={audit?.title ?? `${business.name} Presence Audit`}
          executiveSummary={audit?.executiveSummary ?? ""}
          clientSummary={audit?.clientSummary ?? ""}
          internalSummary={audit?.internalSummary ?? ""}
          strengths={audit?.strengths ?? asStringArray(submission.strengths)}
          improvementOpportunities={
            audit?.improvementOpportunities ?? asStringArray(submission.improvementAreas)
          }
          nextSteps={audit?.nextSteps ?? []}
          actionPlan={audit?.actionPlan ?? []}
          sections={auditSections}
          checklistItems={checklistItems}
          evidence={evidence}
          selectedPlanSlugs={
            audit?.planRecommendations.map((recommendation) => recommendation.servicePlan.slug) ??
            []
          }
          serviceRecommendationRationale={audit?.planRecommendations[0]?.rationale ?? ""}
          availablePlans={availablePlans.map((plan) => ({
            slug: plan.slug,
            name: plan.name,
            tierLabel: plan.tierLabel,
          }))}
          canUnpublish={canUnpublishAudit(
            user,
            submission.followUps.map((followUp) => followUp.status),
          )}
        />
      </div>
    </div>
  );
}
