import type { ScoreTier, SubmissionStatus } from "@prisma/client";

import { CompanyPipelineCard } from "@/components/workspace/company-pipeline-card";
import { SubmissionFilters } from "@/components/workspace/submission-filters";
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
    <div className="space-y-7">
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-5">
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

      <SubmissionFilters basePath="/workspace" current={parsed} />

      <div className="surface-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Grouped pipeline</p>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
              Company records first, submission history underneath
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Each business now acts as the primary workspace record, with nested
              presence checks, lifecycle visibility, and direct paths into the Audit Studio.
            </p>
          </div>
          <p className="text-sm text-slate-500">{workspace.companies.length} companies</p>
        </div>

        {workspace.companies.length ? (
          <div className="mt-6 grid gap-5">
            {workspace.companies.map((company) => (
              <CompanyPipelineCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
            <h3 className="font-heading text-2xl font-semibold text-slate-950">
              No companies match these filters.
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
