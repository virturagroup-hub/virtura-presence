import Link from "next/link";
import type { ScoreTier, SubmissionStatus } from "@prisma/client";

import { SubmissionFilters } from "@/components/workspace/submission-filters";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import { scoreTierLabel } from "@/lib/display";
import { getWorkspaceDashboardData } from "@/lib/data/workspace";
import { workspaceSearchSchema } from "@/lib/validations/workspace-filters";

type WorkspacePageProps = {
  searchParams: Promise<{
    search?: string;
    status?: SubmissionStatus;
    scoreTier?: ScoreTier;
    sort?: string;
    category?: string;
    state?: string;
  }>;
};

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const parsed = workspaceSearchSchema.parse(await searchParams);
  const workspace = await getWorkspaceDashboardData(parsed);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-5">
        {workspace.summaryCards.map((card) => (
          <div key={card.label} className="surface-card p-5">
            <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
              {card.label}
            </p>
            <div className="mt-4 text-4xl font-semibold text-slate-950">{card.value}</div>
            <p className="mt-2 text-sm text-slate-600">{card.change}</p>
          </div>
        ))}
      </div>

      <SubmissionFilters current={parsed} />

      <div id="submission-list" className="surface-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Live submission queue</p>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
              Real submissions, filters, and consultant-ready detail views
            </h2>
          </div>
          <p className="text-sm text-slate-500">{workspace.submissions.length} results</p>
        </div>

        {workspace.submissions.length ? (
          <div className="mt-6 space-y-4">
            {workspace.submissions.map((submission) => (
              <article
                key={submission.id}
                className="rounded-[28px] border border-slate-200/70 bg-white/88 px-5 py-5"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-heading text-2xl font-semibold text-slate-950">
                        {submission.businessName}
                      </h3>
                      <StatusBadge value={submission.status.replaceAll("_", " ")} />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {submission.contactEmail} · {submission.city}, {submission.state} ·{" "}
                      {submission.businessCategory}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Submitted {formatDate(submission.submittedAt)} ·{" "}
                      {submission.serviceArea}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                      Score {submission.score ?? "--"}
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                      {scoreTierLabel(submission.scoreTier) ?? "Score pending"}
                    </div>
                    {submission.comprehensiveRequests[0] ? (
                      <div className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-sm text-violet-700">
                        Deep audit {submission.comprehensiveRequests[0].status.replaceAll("_", " ").toLowerCase()}
                      </div>
                    ) : null}
                    <Button asChild className="rounded-full px-4">
                      <Link href={`/workspace/submissions/${submission.id}`}>
                        Open submission
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
            <h3 className="font-heading text-2xl font-semibold text-slate-950">
              No submissions match these filters.
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Try broadening the search terms or clearing one of the active filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
