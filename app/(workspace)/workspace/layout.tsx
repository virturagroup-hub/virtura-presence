import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { workspaceNavigation } from "@/lib/navigation";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole(["CONSULTANT", "ADMIN"], "/workspace");

  return (
    <DashboardShell
      title="Consultant Workspace"
      description="Group submissions by company, move audits through a real studio workflow, send client-ready notifications intentionally, and keep the client lifecycle visible from first check to ongoing care."
      navigation={workspaceNavigation}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}
