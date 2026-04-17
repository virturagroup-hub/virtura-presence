import { WorkspaceReportsOverview } from "@/components/workspace/workspace-reports-overview";
import { getWorkspaceReportsData } from "@/lib/data/workspace";
import { getEmailDeliverySummary } from "@/lib/email/config";

export default async function WorkspaceReportsPage() {
  const [reports, deliverySummary] = await Promise.all([
    getWorkspaceReportsData(),
    Promise.resolve(getEmailDeliverySummary()),
  ]);

  return (
    <WorkspaceReportsOverview
      reports={reports}
      deliverySummary={deliverySummary}
    />
  );
}
