"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { sendWorkspaceNotificationAction } from "@/lib/actions/workspace";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/dates";

type WorkspaceEmailActionsProps = {
  businessId: string;
  submissionId?: string | null;
  latestEvents?: Array<{
    id: string;
    type: string;
    status: string;
    subject?: string | null;
    createdAt: Date;
    processedAt?: Date | null;
  }>;
  hasAudit?: boolean;
  hasComprehensiveAudit?: boolean;
};

const actions = [
  {
    kind: "quick_report" as const,
    label: "Send free report",
    requiresAudit: false,
    requiresComprehensive: false,
  },
  {
    kind: "audit_available" as const,
    label: "Send audit available",
    requiresAudit: true,
    requiresComprehensive: false,
  },
  {
    kind: "follow_up" as const,
    label: "Send follow-up",
    requiresAudit: false,
    requiresComprehensive: false,
  },
  {
    kind: "comprehensive_ready" as const,
    label: "Send comprehensive ready",
    requiresAudit: true,
    requiresComprehensive: true,
  },
];

export function WorkspaceEmailActions({
  businessId,
  submissionId,
  latestEvents = [],
  hasAudit = false,
  hasComprehensiveAudit = false,
}: WorkspaceEmailActionsProps) {
  const [isPending, startTransition] = useTransition();

  function send(kind: (typeof actions)[number]["kind"]) {
    startTransition(async () => {
      const response = await sendWorkspaceNotificationAction({
        businessId,
        submissionId: submissionId ?? undefined,
        kind,
      });

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      toast.success("Email action queued.");
    });
  }

  return (
    <div className="surface-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Client email actions</p>
          <h2 className="mt-4 font-heading text-2xl font-semibold text-slate-950">
            Make delivery and follow-up explicit
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          Use the current notification pipeline instead of hidden automation.
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {actions.map((action) => {
          const disabled =
            isPending ||
            (action.requiresAudit && !hasAudit) ||
            (action.requiresComprehensive && !hasComprehensiveAudit);

          return (
            <button
              key={action.kind}
              type="button"
              onClick={() => send(action.kind)}
              disabled={disabled}
              className="flex min-h-14 items-center justify-between rounded-[24px] border border-slate-200/70 bg-white/90 px-4 py-4 text-left text-sm font-semibold text-slate-900 transition hover:border-brand-200 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <span>{action.label}</span>
              <span className="text-xs text-slate-500">
                {action.requiresComprehensive
                  ? "Requires comprehensive audit"
                  : action.requiresAudit
                    ? "Requires saved audit"
                    : "Available now"}
              </span>
            </button>
          );
        })}
      </div>

      {latestEvents.length ? (
        <div className="mt-5 grid gap-3">
          {latestEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 px-4 py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {event.subject ?? event.type.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Created {formatDateTime(event.createdAt)}
                    {event.processedAt ? ` · Processed ${formatDateTime(event.processedAt)}` : ""}
                  </p>
                </div>
                <StatusBadge value={event.status.toLowerCase()} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
