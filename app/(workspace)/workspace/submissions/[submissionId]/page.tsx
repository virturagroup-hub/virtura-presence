import { notFound } from "next/navigation";

import { AuditCategory } from "@prisma/client";

import { AuditEditorForm } from "@/components/workspace/audit-editor-form";
import { InternalNoteForm } from "@/components/workspace/internal-note-form";
import { SubmissionStatusForm } from "@/components/workspace/submission-status-form";
import { ScorePanel } from "@/components/shared/score-panel";
import { StatusBadge } from "@/components/shared/status-badge";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import {
  categoryLabelFromKey,
  scoreTierLabel,
  submissionStatusLabel,
} from "@/lib/display";
import { getWorkspaceSubmissionDetail } from "@/lib/data/workspace";
import { canUnpublishAudit } from "@/lib/permissions";
import { asStringArray } from "@/lib/text";

type SubmissionDetailPageProps = {
  params: Promise<{
    submissionId: string;
  }>;
};

export default async function SubmissionDetailPage({
  params,
}: SubmissionDetailPageProps) {
  const { submissionId } = await params;
  const detail = await getWorkspaceSubmissionDetail(submissionId);
  const user = await getCurrentUser();

  if (!detail || !user?.id) {
    notFound();
  }

  const { submission, availablePlans } = detail;
  const audit = submission.audit;
  const auditSections =
    audit?.sections.length
      ? audit.sections
      : submission.categoryScores.map((category) => ({
          id: `${submission.id}-${category.category}`,
          auditId: audit?.id ?? "draft",
          category: category.category,
          score: category.score,
          headline: categoryLabelFromKey(category.category),
          clientFacingNotes: category.note,
          internalNotes: "",
          displayOrder: category.displayOrder,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        }));

  return (
    <div className="space-y-8">
      <div className="surface-card p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="section-kicker">Submission detail</p>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
              {submission.businessName}
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              {submission.city}, {submission.state} · {submission.businessCategory}
            </p>
          </div>
          <StatusBadge value={submissionStatusLabel(submission.status)} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="surface-card p-6">
            <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
              Onboarding answers
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Owner", submission.ownerName],
                ["Email", submission.contactEmail],
                ["Phone", submission.contactPhone ?? "Not provided"],
                ["Service area", submission.serviceArea],
                ["Website", submission.websiteUrl ?? "No site listed"],
                [
                  "Google profile",
                  submission.googleBusinessProfileUrl ?? "No profile listed",
                ],
                ["Social platforms", asStringArray(submission.socialPlatforms).join(", ") || "None listed"],
                ["Discovery", asStringArray(submission.discoveryChannels).join(", ") || "None listed"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-slate-200/70 bg-white/85 px-4 py-4"
                >
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-medium leading-7 text-slate-800">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <SubmissionStatusForm
            submissionId={submission.id}
            currentStatus={submission.status}
          />

          <div className="surface-card p-6">
            <p className="section-kicker">Client link</p>
            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <p>
                Linked user:{" "}
                <span className="font-semibold text-slate-950">
                  {submission.submittedBy?.name ?? "Not claimed yet"}
                </span>
              </p>
              <p>Submitted {formatDateTime(submission.submittedAt)}</p>
              <p>Last updated {formatDateTime(submission.updatedAt)}</p>
            </div>
          </div>

          <InternalNoteForm submissionId={submission.id} />

          {submission.internalNotes.length ? (
            <div className="surface-card p-6">
              <p className="section-kicker">Saved internal notes</p>
              <div className="mt-5 space-y-4">
                {submission.internalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-[28px] border border-slate-200/70 bg-white/88 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {note.title ?? "Internal note"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {note.author?.name ?? "Consultant"} · {formatDateTime(note.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-700">{note.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
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

      <AuditEditorForm
        submissionId={submission.id}
        status={audit?.status ?? "DRAFT"}
        title={audit?.title ?? "Manual Presence Audit"}
        executiveSummary={audit?.executiveSummary ?? ""}
        clientSummary={audit?.clientSummary ?? ""}
        internalSummary={audit?.internalSummary ?? ""}
        strengths={audit?.strengths ?? asStringArray(submission.strengths)}
        improvementOpportunities={
          audit?.improvementOpportunities ?? asStringArray(submission.improvementAreas)
        }
        nextSteps={audit?.nextSteps ?? []}
        sections={auditSections.map((section) => ({
          category: section.category as AuditCategory,
          score: section.score ?? 0,
          headline: section.headline,
          clientFacingNotes: section.clientFacingNotes,
          internalNotes: section.internalNotes ?? "",
        }))}
        selectedPlanSlugs={
          audit?.planRecommendations.map((recommendation) => recommendation.servicePlan.slug) ??
          []
        }
        serviceRecommendationRationale={
          audit?.planRecommendations[0]?.rationale ?? ""
        }
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

      {submission.followUps.length ? (
        <div className="surface-card p-6">
          <p className="section-kicker">Follow-up timeline</p>
          <div className="mt-5 space-y-4">
            {submission.followUps.map((followUp) => (
              <div
                key={followUp.id}
                className="rounded-[28px] border border-slate-200/70 bg-white/88 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {followUp.subject ?? "Follow-up event"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(followUp.createdAt)}
                    </p>
                  </div>
                  <StatusBadge value={followUp.status.replaceAll("_", " ")} />
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-700">
                  {followUp.notes ?? "No additional follow-up notes yet."}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {submission.notificationEvents.length ? (
        <div className="surface-card p-6">
          <p className="section-kicker">Automation-ready event log</p>
          <div className="mt-5 space-y-3">
            {submission.notificationEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-[24px] border border-slate-200/70 bg-white/88 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {event.type.replaceAll("_", " ")}
                  </p>
                  <p className="text-xs text-slate-500">{formatDateTime(event.createdAt)}</p>
                </div>
                {event.subject ? (
                  <p className="mt-2 text-sm text-slate-600">{event.subject}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
