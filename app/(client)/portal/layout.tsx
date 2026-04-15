import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { portalNavigation } from "@/lib/navigation";
import { requireRole } from "@/lib/auth";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole(["CLIENT", "CONSULTANT", "ADMIN"], "/portal");

  return (
    <DashboardShell
      title="Client Portal"
      description="Review your quick assessment, published audit findings, and practical next steps without pressure-heavy sales language."
      navigation={portalNavigation}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}
