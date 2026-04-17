"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  MailCheck,
  RotateCcw,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import {
  retryWorkspaceNotificationAction,
  sendWorkspaceNotificationAction,
} from "@/lib/actions/workspace";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/dates";
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
  latestEvents?: Array<{
    id: string;
    type: string;
    status: string;
    subject?: string | null;
    recipient?: string | null;
    createdAt: Date;
    processedAt?: Date | null;
    errorMessage?: string | null;
    providerMessageId?: string | null;
    channel?: string | null;
  }>;
  hasAudit?: boolean;
  hasComprehensiveAudit?: boolean;
};

const actions = [
  {
    kind: "quick_report" as const,
    label: "Send free report",
    description: "Resend the quick review summary and portal entry point.",
    requirementLabel: "Available now",
    requiresAudit: false,
    requiresComprehensive: false,
  },
  {
    kind: "audit_available" as const,
    label: "Send audit available",
    description: "Tell the client that a consultant-reviewed audit is ready to open.",
    requirementLabel: "Requires saved audit",
    requiresAudit: true,
    requiresComprehensive: false,
  },
  {
    kind: "follow_up" as const,
    label: "Send follow-up",
    description: "Send a grounded follow-up without turning it into a pressure sequence.",
    requirementLabel: "Available now",
    requiresAudit: false,
    requiresComprehensive: false,
  },
  {
    kind: "comprehensive_ready" as const,
    label: "Send comprehensive ready",
    description: "Notify the client when the deeper comprehensive review is ready.",
    requirementLabel: "Requires comprehensive audit",
    requiresAudit: true,
    requiresComprehensive: true,
  },
];

const summaryToneStyles = {
  resend: "border-emerald-200/70 bg-emerald-50/80 text-emerald-900",
  log: "border-brand-100 bg-brand-50/80 text-brand-900",
  disabled: "border-amber-200/70 bg-amber-50/85 text-amber-900",
} satisfies Record<WorkspaceEmailActionsProps["deliverySummary"]["mode"], string>;

const summaryIconMap = {
  resend: CheckCircle2,
  log: Clock3,
  disabled: AlertCircle,
} satisfies Record<WorkspaceEmailActionsProps["deliverySummary"]["mode"], typeof CheckCircle2>;

function fallbackEventTitle(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^\w)|(\s\w)/g, (segment) => segment.toUpperCase());
}

export function WorkspaceEmailActions({
  businessId,
  submissionId,
  deliverySummary,
  latestEvents = [],
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

  function retry(eventId: string) {
    setPendingAction(eventId);

    startTransition(async () => {
      const response = await retryWorkspaceNotificationAction({
        eventId,
      });

      setPendingAction(null);

      if (!response.success) {
        toast.error(response.error);
        router.refresh();
        return;
      }

      toast.success(response.message ?? "Notification sent successfully.");
      router.refresh();
    });
  }

  const SummaryIcon = summaryIconMap[deliverySummary.mode];

  return (
    <div className="surface-card p-6 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Client email actions</p>
          <h2 className="mt-4 font-heading text-2xl font-semibold text-slate-950">
            Make delivery and follow-up explicit
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-7 text-slate-500 sm:text-right">
          Delivery stays observable here so consultants can see what was sent, what failed, and what needs another pass.
        </p>
      </div>

      <div
        className={cn(
          "mt-5 rounded-[26px] border px-4 py-4 sm:px-5",
          summaryToneStyles[deliverySummary.mode],
        )}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full border border-white/80 bg-white/70 p-2">
              <SummaryIcon className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] uppercase">
                {deliverySummary.label}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-7 opacity-90">
                {deliverySummary.description}
              </p>
            </div>
          </div>
          {deliverySummary.from ? (
            <div className="rounded-full border border-white/80 bg-white/75 px-3 py-2 text-xs font-medium text-slate-700">
              Sender: {deliverySummary.from}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {actions.map((action) => {
          const blockedByAudit = action.requiresAudit && !hasAudit;
          const blockedByComprehensive =
            action.requiresComprehensive && !hasComprehensiveAudit;
          const disabled =
            isPending ||
            !deliverySummary.canSend ||
            blockedByAudit ||
            blockedByComprehensive;

          return (
            <div
              key={action.kind}
              className="rounded-[26px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_22px_45px_-38px_rgba(15,23,42,0.28)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{action.label}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{action.description}</p>
                </div>
                <MailCheck className="mt-1 size-4 text-brand-500" />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusBadge
                  value={
                    !deliverySummary.canSend
                      ? "disabled"
                      : blockedByComprehensive
                        ? "requires comprehensive audit"
                        : blockedByAudit
                          ? "requires saved audit"
                          : "available now"
                  }
                  className={cn(
                    !deliverySummary.canSend &&
                      "bg-amber-50 text-amber-700 ring-amber-100",
                    blockedByAudit &&
                      "bg-slate-100 text-slate-700 ring-slate-200",
                    blockedByComprehensive &&
                      "bg-violet-50 text-violet-700 ring-violet-100",
                  )}
                />
                <span className="text-xs text-slate-500">{action.requirementLabel}</span>
              </div>

              <Button
                type="button"
                size="lg"
                variant={disabled ? "outline" : "default"}
                onClick={() => send(action.kind)}
                disabled={disabled}
                className="mt-5 h-11 w-full rounded-full"
              >
                {pendingAction === action.kind ? "Working..." : action.label}
                <Send className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Notification history</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Delivery state, timestamps, provider IDs, and error details stay visible here instead of disappearing behind a single badge.
            </p>
          </div>
          <p className="text-sm text-slate-500">{latestEvents.length} recent event(s)</p>
        </div>

        {latestEvents.length ? (
          <div className="mt-4 grid gap-3">
            {latestEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-[24px] border border-slate-200/70 bg-slate-50/85 px-4 py-4 shadow-[0_18px_40px_-36px_rgba(15,23,42,0.25)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold text-slate-950">
                        {event.subject ?? fallbackEventTitle(event.type)}
                      </p>
                      <StatusBadge value={event.status.toLowerCase()} />
                      {event.channel ? (
                        <StatusBadge
                          value={event.channel}
                          className="bg-white text-slate-600 ring-slate-200"
                        />
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500">
                      Created {formatDateTime(event.createdAt)}
                      {event.processedAt
                        ? ` · Last attempt ${formatDateTime(event.processedAt)}`
                        : ""}
                    </p>
                    {event.recipient ? (
                      <p className="text-xs text-slate-500">Recipient: {event.recipient}</p>
                    ) : null}
                    {event.providerMessageId ? (
                      <p className="text-xs text-slate-500">
                        Provider message ID: {event.providerMessageId}
                      </p>
                    ) : null}
                  </div>

                  {event.status === "FAILED" && deliverySummary.canSend ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => retry(event.id)}
                      disabled={isPending}
                    >
                      {pendingAction === event.id ? "Retrying..." : "Retry send"}
                      <RotateCcw className="size-3.5" />
                    </Button>
                  ) : null}
                </div>

                {event.errorMessage ? (
                  <div className="mt-4 rounded-[20px] border border-rose-200/80 bg-rose-50/90 px-4 py-3">
                    <p className="text-[11px] font-semibold tracking-[0.2em] text-rose-700 uppercase">
                      Delivery detail
                    </p>
                    <p className="mt-2 text-sm leading-7 text-rose-800">{event.errorMessage}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[26px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-6 text-center">
            <p className="text-sm font-semibold text-slate-900">No notification attempts yet</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Once you send a report, audit notice, or follow-up, the delivery state will show up here with timestamps and diagnostics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
