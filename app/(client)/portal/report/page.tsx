import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AuditCategoryBlock } from "@/components/shared/audit-category-block";
import { ComprehensiveReportRequestDialog } from "@/components/shared/comprehensive-report-request-dialog";
import { ServicePlanCard } from "@/components/shared/service-plan-card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { categoryLabelFromKey } from "@/lib/display";
import { getPortalDashboardData } from "@/lib/data/portal";
import { resolveServicePlanDefinition } from "@/lib/plan-catalog";
import { asStringArray } from "@/lib/text";

export default async function PortalReportPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return null;
  }

  const portal = await getPortalDashboardData(user.id);
  const publishedSubmission = portal.submissions.find(
    (submission) => submission.audit?.status === "PUBLISHED",
  );
  const publishedAudit = publishedSubmission?.audit;

  if (!publishedSubmission || !publishedAudit) {
    const latestSubmission = portal.latestSubmission;

    return (
      <div className="surface-card p-8">
        <p className="section-kicker">Published report</p>
        <h2 className="mt-4 font-heading text-4xl font-semibold text-slate-950">
          A consultant-reviewed audit is not published yet.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Your quick score is still available in the portal. Once the consultant review
          is published, the full client-safe audit will appear here automatically.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="rounded-full px-5">
            <Link href="/portal">
              Back to overview
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          {latestSubmission ? (
            <ComprehensiveReportRequestDialog
              submissionId={latestSubmission.id}
              existingStatus={
                latestSubmission.comprehensiveRequests[0]
                  ? latestSubmission.comprehensiveRequests[0].status
                      .replaceAll("_", " ")
                      .toLowerCase()
                  : null
              }
              className="rounded-full px-5"
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <p className="section-kicker">Published manual audit</p>
        <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
          Consultant-reviewed findings for {publishedSubmission.businessName}
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
          {publishedAudit.clientSummary ??
            "Your manual audit is published. Review the sections below for the clearest strengths, improvement opportunities, and next steps."}
        </p>
        <p className="mt-4 text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
          Published {formatDate(publishedAudit.publishedAt)}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <ComprehensiveReportRequestDialog
            submissionId={publishedSubmission.id}
            existingStatus={
              publishedSubmission.comprehensiveRequests[0]
                ? publishedSubmission.comprehensiveRequests[0].status
                    .replaceAll("_", " ")
                    .toLowerCase()
                : null
            }
            className="rounded-full px-5"
          />
          <Button asChild variant="outline" className="rounded-full px-5">
            <Link href="/portal/profile">Update company profile</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {publishedAudit.strengths.map((item) => (
          <div key={item} className="rounded-[28px] border border-emerald-100 bg-emerald-50/80 p-5">
            <p className="text-sm leading-7 text-emerald-900">{item}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5">
        {publishedAudit.sections.map((section) => (
          <AuditCategoryBlock
            key={section.category}
            category={categoryLabelFromKey(section.category)}
            score={section.score ?? 0}
            headline={section.headline}
            clientNotes={section.clientFacingNotes}
          />
        ))}
      </div>

      {publishedAudit.nextSteps.length ? (
        <div className="surface-card p-6">
          <p className="section-kicker">Recommended next steps</p>
          <div className="mt-5 space-y-3">
            {publishedAudit.nextSteps.map((step) => (
              <div
                key={step}
                className="rounded-[24px] border border-slate-200/70 bg-white/88 px-4 py-4 text-sm leading-7 text-slate-700"
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {publishedAudit.planRecommendations.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {publishedAudit.planRecommendations.map((recommendation) => (
            <ServicePlanCard
              key={recommendation.id}
              plan={resolveServicePlanDefinition({
                slug: recommendation.servicePlan.slug,
                name: recommendation.servicePlan.name,
                tagline: recommendation.servicePlan.tagline,
                summary: recommendation.servicePlan.summary,
                idealFor: recommendation.servicePlan.idealFor,
                tierLabel: recommendation.servicePlan.tierLabel,
                accentColor:
                  recommendation.servicePlan.accentColor ?? "from-brand-500/20 to-cyan-300/20",
                deliverables: asStringArray(recommendation.servicePlan.deliverables),
                outcomes: asStringArray(recommendation.servicePlan.outcomes),
                featured: recommendation.servicePlan.featured,
              })}
              mode="dashboard"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
