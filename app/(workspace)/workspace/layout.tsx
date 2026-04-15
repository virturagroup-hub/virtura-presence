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
      description="Review lead submissions, draft manual audits, publish findings to client portals, and track next-step recommendations."
      navigation={workspaceNavigation}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}
