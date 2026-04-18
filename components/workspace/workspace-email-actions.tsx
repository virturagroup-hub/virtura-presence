"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MailCheck, Send } from "lucide-react";
import { toast } from "sonner";

import { sendWorkspaceNotificationAction } from "@/lib/actions/workspace";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WorkspaceEmailActionsProps = {
  businessId: string;
  submissionId?: string | null;
  deliverySummary: {
    mode: "resend" | "log" | "disabled";
    label: string;
    description: string;
    canSend: boolean;
    from?: string | null;
  };
  hasAudit?: boolean;
  hasComprehensiveAudit?: boolean;
};

const actions = [
  {
    kind: "quick_report" as const,
    label: "Send free report",
    description: "Resend the quick review summary and portal entry point.",
    requirementLabel: "Available now",
    readyText: "Ready to send with the current quick review.",
    blockedText: "A working delivery setup is required before this can go out.",
    requiresAudit: false,
    requiresComprehensive: false,
  },
  {
    kind: "audit_available" as const,
    label: "Send audit available",
    description: "Let the client know a consultant-reviewed audit is ready to open.",
    requirementLabel: "Requires saved audit",
    readyText: "This becomes available once a saved audit exists.",
    blockedText: "Save an audit in Audit Studio first.",
    requiresAudit: true,
    requiresComprehensive: false,
  },
  {
    kind: "follow_up" as const,
    label: "Send follow-up",
    description: "Send a grounded follow-up without turning it into a pressure sequence.",
    requirementLabel: "Available now",
    readyText: "Use this for a practical check-in after review work.",
    blockedText: "A working delivery setup is required before this can go out.",
    requiresAudit: false,
    requiresComprehensive: false,
  },
  {
    kind: "comprehensive_ready" as const,
    label: "Send comprehensive ready",
    description: "Notify the client when the deeper comprehensive review is ready.",
    requirementLabel: "Requires comprehensive audit",
    readyText: "Available after a saved comprehensive audit is on record.",
    blockedText: "Save a comprehensive audit before sending this.",
    requiresAudit: true,
    requiresComprehensive: true,
  },
];

const deliveryBadgeClasses = {
  resend: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  log: "bg-brand-50 text-brand-700 ring-brand-100",
  disabled: "bg-amber-50 text-amber-700 ring-amber-100",
} satisfies Record<WorkspaceEmailActionsProps["deliverySummary"]["mode"], string>;

export function WorkspaceEmailActions({
  businessId,
  submissionId,
  deliverySummary,
  hasAudit = false,
  hasComprehensiveAudit = false,
}: WorkspaceEmailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  function send(kind: (typeof actions)[number]["kind"]) {
    setPendingAction(kind);

    startTransition(async () => {
      const response = await sendWorkspaceNotificationAction({
        businessId,
        submissionId: submissionId ?? undefined,
        kind,
      });

      setPendingAction(null);

      if (!response.success) {
        toast.error(response.error);
        router.refresh();
        return;
      }

      toast.success(response.message ?? "Email delivery completed.");
      router.refresh();
    });
  }

  return (
    <div className="surface-card p-6 sm:p-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="section-kicker">Client email actions</p>
          <h2 className="mt-4 font-heading text-xl font-semibold text-slate-950 sm:text-2xl">
            Send client emails
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Use this panel for report delivery and follow-up. Delivery issues and sender alerts now
            live in Reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge
            value={deliverySummary.label}
            className={deliveryBadgeClasses[deliverySummary.mode]}
          />
          <Button asChild variant="outline" size="sm" className="rounded-full px-4">
            <Link href="/workspace/reports">
              View reports & alerts
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {actions.map((action) => {
          const blockedByAudit = action.requiresAudit && !hasAudit;
          const blockedByComprehensive =
            action.requiresComprehensive && !hasComprehensiveAudit;
          const disabled =
            isPending ||
            !deliverySummary.canSend ||
            blockedByAudit ||
            blockedByComprehensive;
          const availabilityLabel = !deliverySummary.canSend
            ? "disabled"
            : blockedByComprehensive
              ? "requires comprehensive audit"
              : blockedByAudit
                ? "requires saved audit"
                : "available now";
          const helperText =
            !deliverySummary.canSend || blockedByAudit || blockedByComprehensive
              ? action.blockedText
              : action.readyText;

          return (
            <div
              key={action.kind}
              className="flex h-full flex-col rounded-[26px] border border-slate-200/70 bg-white/92 p-4 shadow-[0_24px_48px_-38px_rgba(15,23,42,0.28)] sm:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <p className="text-sm font-semibold text-slate-950">{action.label}</p>
                  <p className="text-sm leading-6 text-slate-600">{action.description}</p>
                </div>
                <div className="rounded-full border border-brand-100 bg-brand-50/80 p-2 text-brand-600">
                  <MailCheck className="size-4" />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <StatusBadge
                  value={availabilityLabel}
                  className={cn(
                    !deliverySummary.canSend &&
                      "bg-amber-50 text-amber-700 ring-amber-100",
                    blockedByAudit &&
                      "bg-slate-100 text-slate-700 ring-slate-200",
                    blockedByComprehensive &&
                      "bg-violet-50 text-violet-700 ring-violet-100",
                  )}
                />
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">{helperText}</p>

              <Button
                type="button"
                size="lg"
                variant={disabled ? "outline" : "default"}
                onClick={() => send(action.kind)}
                disabled={disabled}
                className="mt-5 h-11 self-start rounded-full px-5"
              >
                {pendingAction === action.kind ? "Working..." : action.label}
                <Send className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
