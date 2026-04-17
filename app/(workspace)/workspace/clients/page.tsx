import type { ScoreTier, SubmissionStatus } from "@prisma/client";

import { CompanyPipelineCard } from "@/components/workspace/company-pipeline-card";
import { SubmissionFilters } from "@/components/workspace/submission-filters";
import { getWorkspaceClientsData } from "@/lib/data/workspace";
import { workspaceSearchSchema } from "@/lib/validations/workspace-filters";

type WorkspaceClientsPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: SubmissionStatus;
    scoreTier?: ScoreTier;
    sort?: string;
    category?: string;
    state?: string;
  }>;
};

export default async function WorkspaceClientsPage({
  searchParams,
}: WorkspaceClientsPageProps) {
  const parsed = workspaceSearchSchema.parse(await searchParams);
  const workspace = await getWorkspaceClientsData(parsed);

  return (
    <div className="space-y-7">
      <SubmissionFilters basePath="/workspace/clients" current={parsed} />

      <div className="surface-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Client records</p>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
              CRM-style company views with lifecycle context
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Open a company record to see profile details, submission history, audit
              history, recommended services, notes, follow-up state, and explicit email actions.
            </p>
          </div>
          <p className="text-sm text-slate-500">{workspace.companies.length} client records</p>
        </div>

        <div className="mt-6 grid gap-5">
          {workspace.companies.map((company) => (
            <CompanyPipelineCard key={company.id} company={company} mode="clients" />
          ))}
        </div>
      </div>
    </div>
  );
}
