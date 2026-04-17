import Link from "next/link";
import { ArrowRight, Building2, ChevronRight, Mail, TrendingUp } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import {
  auditScopeLabel,
  businessLifecycleLabel,
  comprehensiveRequestStatusLabel,
  scoreTierLabel,
  submissionStatusLabel,
} from "@/lib/display";

type CompanyPipelineCardProps = {
  company: {
    id: string;
    name: string;
    ownerName?: string | null;
    primaryEmail: string;
    primaryPhone?: string | null;
    businessCategory: string;
    city: string;
    state: string;
    serviceArea?: string | null;
    status: Parameters<typeof submissionStatusLabel>[0];
    lifecycleStage: Parameters<typeof businessLifecycleLabel>[0];
    quickScore?: number | null;
    quickTier?: Parameters<typeof scoreTierLabel>[0];
    quickSummary?: string | null;
    trendDelta?: number | null;
    submissionCount: number;
    latestSubmissionId?: string | null;
    latestSubmissionAt?: Date | null;
    latestActivityAt?: Date | null;
    latestRequestStatus?: Parameters<typeof comprehensiveRequestStatusLabel>[0];
    latestAuditScope?: Parameters<typeof auditScopeLabel>[0];
    submissions: Array<{
      id: string;
      submittedAt: Date;
      status: Parameters<typeof submissionStatusLabel>[0];
      score?: number | null;
      scoreTier?: Parameters<typeof scoreTierLabel>[0];
      auditScope?: Parameters<typeof auditScopeLabel>[0] | null;
      comprehensiveRequestStatus?: Parameters<typeof comprehensiveRequestStatusLabel>[0] | null;
    }>;
  };
  mode?: "pipeline" | "clients";
};

export function CompanyPipelineCard({
  company,
  mode = "pipeline",
}: CompanyPipelineCardProps) {
  const studioHref = company.latestSubmissionId
    ? `/workspace/audit-studio?businessId=${company.id}&submissionId=${company.latestSubmissionId}`
    : `/workspace/audit-studio?businessId=${company.id}`;

  return (
    <article className="surface-card flex h-full flex-col p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-2xl font-semibold text-slate-950">
              {company.name}
            </h3>
            {businessLifecycleLabel(company.lifecycleStage) ? (
              <StatusBadge value={businessLifecycleLabel(company.lifecycleStage)!} />
            ) : null}
            <StatusBadge value={submissionStatusLabel(company.status)} />
            {company.latestRequestStatus ? (
              <StatusBadge value={comprehensiveRequestStatusLabel(company.latestRequestStatus)!} />
            ) : null}
          </div>

          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p>{company.primaryEmail}</p>
            <p>{company.primaryPhone ?? "Phone not added"}</p>
            <p>
              {company.city}, {company.state}
              {company.serviceArea ? ` · ${company.serviceArea}` : ""}
            </p>
            <p>{company.businessCategory}</p>
          </div>

          {company.quickSummary ? (
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              {company.quickSummary}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 xl:min-w-[320px] xl:items-end">
          <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[320px]">
            <div className="rounded-[24px] border border-brand-100 bg-brand-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-brand-700 uppercase">
                Latest score
              </p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold tracking-tight text-slate-950">
                    {company.quickScore ?? "--"}
                  </p>
                  <p className="mt-1 text-xs text-brand-800">
                    {scoreTierLabel(company.quickTier) ?? "Score pending"}
                  </p>
                </div>
                {company.trendDelta !== null && company.trendDelta !== undefined ? (
                  <div className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                    <TrendingUp className="size-3.5" />
                    {company.trendDelta >= 0 ? "+" : ""}
                    {company.trendDelta}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/70 bg-white/88 px-4 py-4">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
                Activity
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {company.submissionCount} check{company.submissionCount === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Latest activity {formatDate(company.latestActivityAt) ?? "Not yet tracked"}
              </p>
              {company.latestAuditScope ? (
                <p className="mt-1 text-xs text-slate-500">
                  {auditScopeLabel(company.latestAuditScope)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href={`/workspace/clients/${company.id}`}>
                Open company
                <Building2 className="size-4" />
              </Link>
            </Button>
            <Button asChild className="rounded-full px-5">
              <Link href={studioHref}>
                Open studio
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-kicker">
              {mode === "pipeline" ? "Submission history" : "Client activity"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Each check stays visible under the company record instead of splitting the account into separate rows.
            </p>
          </div>
          <p className="text-sm text-slate-500">
            Latest check {formatDate(company.latestSubmissionAt) ?? "pending"}
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          {company.submissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-[24px] border border-white/80 bg-white/92 px-4 py-4 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.34)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold text-slate-950">
                      {formatDate(submission.submittedAt)}
                    </p>
                    <StatusBadge value={submissionStatusLabel(submission.status)} />
                    {submission.comprehensiveRequestStatus ? (
                      <StatusBadge
                        value={
                          comprehensiveRequestStatusLabel(
                            submission.comprehensiveRequestStatus,
                          )!
                        }
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {submission.score ?? "--"} score
                    {submission.scoreTier ? ` · ${scoreTierLabel(submission.scoreTier)}` : ""}
                    {submission.auditScope ? ` · ${auditScopeLabel(submission.auditScope)}` : ""}
                  </p>
                </div>

                <Button asChild variant="ghost" className="justify-between rounded-full px-4 text-slate-700">
                  <Link href={`/workspace/audit-studio?businessId=${company.id}&submissionId=${submission.id}`}>
                    Open this check
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Mail className="size-3.5" />
            Contact owner: {company.ownerName ?? company.name}
          </span>
        </div>
      </div>
    </article>
  );
}
