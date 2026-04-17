import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";

import { RetryNotificationButton } from "@/components/workspace/retry-notification-button";
import { WorkspaceEmptyState, WorkspaceSection } from "@/components/workspace/workspace-primitives";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/dates";
import { businessLifecycleLabel } from "@/lib/display";

type WorkspaceReportsOverviewProps = {
  deliverySummary: {
    mode: "resend" | "log" | "disabled";
    label: string;
    description: string;
    canSend: boolean;
    from?: string | null;
  };
  reports: {
    monthStart: Date;
    summaryCards: Array<{
      label: string;
      value: string;
      change: string;
    }>;
    lifecycleBreakdown: Array<{
      stage: Parameters<typeof businessLifecycleLabel>[0];
      count: number;
    }>;
    serviceBreakdown: Array<{
      slug: string;
      name: string;
      acceptedCount: number;
      presentedCount: number;
      proposedCount: number;
    }>;
    failedEmailAlerts: Array<{
      id: string;
      title: string;
      businessId: string | null;
      businessName: string;
      recipient: string | null;
      errorMessage: string;
      createdAt: Date;
      processedAt: Date | null;
      severity: "critical" | "warning";
    }>;
    insecureLinkAlerts: Array<{
      id: string;
      businessId: string;
      businessName: string;
      websiteUrl: string | null;
      googleBusinessProfileUrl: string | null;
      updatedAt: Date;
    }>;
    alertSummary: {
      failedEmailsTotal: number;
      senderAuthorizationFailures: number;
      insecureLinkCount: number;
      activeComprehensiveRequests: number;
    };
  };
};

const deliveryToneClasses = {
  resend: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  log: "bg-brand-50 text-brand-700 ring-brand-100",
  disabled: "bg-amber-50 text-amber-700 ring-amber-100",
} satisfies Record<WorkspaceReportsOverviewProps["deliverySummary"]["mode"], string>;

const severityClasses = {
  critical: "bg-rose-50 text-rose-700 ring-rose-100",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
} satisfies Record<"critical" | "warning", string>;

export function WorkspaceReportsOverview({
  deliverySummary,
  reports,
}: WorkspaceReportsOverviewProps) {
  const monthLabel = reports.monthStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-7">
      <div className="surface-card p-6 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="section-kicker">Reports and alerts</p>
            <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-slate-950">
              Track audit volume, customer growth, service uptake, and operational alerts
            </h2>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
              This view keeps consultant reporting practical: free audit volume, customer
              conversion signals, accepted services, comprehensive audit demand, and the
              delivery or security issues that actually need attention.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/workspace">
                Back to pipeline
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild className="rounded-full px-5">
              <Link href="/workspace/audit-studio">Open Audit Studio</Link>
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <StatusBadge
            value={deliverySummary.label}
            className={deliveryToneClasses[deliverySummary.mode]}
          />
          <StatusBadge
            value={`${monthLabel} snapshot`}
            className="bg-white text-slate-600 ring-slate-200"
          />
          {deliverySummary.from ? (
            <span className="rounded-full border border-slate-200/80 bg-white/90 px-3 py-2 text-xs text-slate-600">
              Sender {deliverySummary.from}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-5">
        {reports.summaryCards.map((card) => (
          <div key={card.label} className="surface-card p-5">
            <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
              {card.label}
            </p>
            <div className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              {card.value}
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <WorkspaceSection
          kicker="Service activity"
          title="Accepted work and next-step momentum"
          description="Accepted recommendations are treated as purchased work until billing and invoicing are added later."
        >
          {reports.serviceBreakdown.length ? (
            <div className="grid gap-4">
              {reports.serviceBreakdown.map((plan) => (
                <div
                  key={plan.slug}
                  className="rounded-[24px] border border-slate-200/70 bg-white/92 p-4 shadow-[0_22px_45px_-38px_rgba(15,23,42,0.22)]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-950">{plan.name}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Accepted services show confirmed work. Presented and proposed counts show
                        what is still in play.
                      </p>
                    </div>

                    <div className="grid min-w-[260px] gap-3 sm:grid-cols-3">
                      {[
                        {
                          label: "Accepted",
                          value: plan.acceptedCount,
                          tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
                        },
                        {
                          label: "Presented",
                          value: plan.presentedCount,
                          tone: "bg-brand-50 text-brand-700 ring-brand-100",
                        },
                        {
                          label: "Proposed",
                          value: plan.proposedCount,
                          tone: "bg-slate-100 text-slate-700 ring-slate-200",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[20px] border border-slate-200/70 bg-slate-50/75 px-4 py-3"
                        >
                          <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
                            {item.label}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <p className="text-2xl font-semibold text-slate-950">
                              {item.value}
                            </p>
                            <StatusBadge value={item.label} className={item.tone} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <WorkspaceEmptyState
              title="No service activity yet"
              description="Once recommendations start being accepted, the workspace will show service purchase momentum here."
            />
          )}
        </WorkspaceSection>

        <WorkspaceSection
          kicker="Client lifecycle"
          title="Where companies are sitting right now"
          description="This keeps the CRM side honest by showing how many companies are still leads, in audit motion, converted, or in ongoing care."
          tone="muted"
        >
          {reports.lifecycleBreakdown.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {reports.lifecycleBreakdown.map((item) => (
                <div
                  key={String(item.stage)}
                  className="rounded-[22px] border border-slate-200/70 bg-white/92 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {businessLifecycleLabel(item.stage) ?? "Lifecycle stage"}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Companies currently sitting in this stage
                      </p>
                    </div>
                    <div className="text-3xl font-semibold tracking-tight text-slate-950">
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <WorkspaceEmptyState
              title="Lifecycle reporting is still empty"
              description="Once free audits and follow-up begin to move through the workspace, lifecycle counts will start to fill in here."
            />
          )}
        </WorkspaceSection>
      </div>

      <WorkspaceSection
        kicker="Security and delivery alerts"
        title="Operational alerts that need human attention"
        description="This panel currently covers delivery failures and insecure stored links. It is intentionally honest: Virtura Presence does not claim to be running live external cyber threat monitoring yet."
        tone="muted"
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <div className="rounded-[24px] border border-slate-200/70 bg-white/92 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-amber-600" />
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  Failed email sends
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {reports.alertSummary.failedEmailsTotal}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/70 bg-white/92 p-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-rose-600" />
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  Sender auth issues
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {reports.alertSummary.senderAuthorizationFailures}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/70 bg-white/92 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-amber-600" />
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  Insecure links
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {reports.alertSummary.insecureLinkCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/70 bg-white/92 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-brand-600" />
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  Active requests
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {reports.alertSummary.activeComprehensiveRequests}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!deliverySummary.canSend || deliverySummary.mode !== "resend" ? (
          <div className="mt-5 rounded-[24px] border border-amber-200/80 bg-amber-50/88 px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-900">{deliverySummary.label}</p>
                <p className="mt-2 text-sm leading-7 text-amber-800">
                  {deliverySummary.description}
                </p>
              </div>
              <StatusBadge
                value={deliverySummary.mode === "disabled" ? "Delivery disabled" : "Log mode"}
                className="bg-white text-amber-700 ring-amber-200"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="section-kicker">Delivery alerts</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Failed sends are tracked here so the Audit Studio and client views can stay
                  focused on action instead of raw error logging.
                </p>
              </div>
              <p className="text-sm text-slate-500">{reports.failedEmailAlerts.length} recent</p>
            </div>

            {reports.failedEmailAlerts.length ? (
              <div className="mt-4 grid gap-3">
                {reports.failedEmailAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-[24px] border border-slate-200/70 bg-white/92 p-4 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.25)]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-sm font-semibold text-slate-950">{alert.title}</p>
                          <StatusBadge
                            value={alert.severity}
                            className={severityClasses[alert.severity]}
                          />
                        </div>
                        <p className="text-sm leading-7 text-slate-600">{alert.errorMessage}</p>
                        <p className="text-xs text-slate-500">
                          {alert.businessId ? (
                            <Link
                              href={`/workspace/clients/${alert.businessId}`}
                              className="font-medium text-brand-700 hover:text-brand-800"
                            >
                              {alert.businessName}
                            </Link>
                          ) : (
                            alert.businessName
                          )}
                          {alert.recipient ? ` · ${alert.recipient}` : ""}
                        </p>
                        <p className="text-xs text-slate-500">
                          Created {formatDateTime(alert.createdAt)}
                          {alert.processedAt
                            ? ` · Last attempt ${formatDateTime(alert.processedAt)}`
                            : ""}
                        </p>
                      </div>

                      <RetryNotificationButton
                        eventId={alert.id}
                        disabled={!deliverySummary.canSend}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <WorkspaceEmptyState
                className="mt-4"
                title="No active delivery failures"
                description="Email actions are currently clear of failed sends. This alert feed will light up here if delivery starts to miss."
              />
            )}
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="section-kicker">Security posture signals</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  These are practical hygiene signals from the data already in Virtura Presence,
                  not a replacement for managed threat monitoring.
                </p>
              </div>
            </div>

            {reports.insecureLinkAlerts.length ? (
              <div className="mt-4 grid gap-3">
                {reports.insecureLinkAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-[24px] border border-slate-200/70 bg-white/92 p-4 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.22)]"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold text-slate-950">{alert.businessName}</p>
                      <StatusBadge
                        value="warning"
                        className="bg-amber-50 text-amber-700 ring-amber-100"
                      />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Stored business links should use HTTPS before they are surfaced in reports or
                      client communications.
                    </p>
                    <div className="mt-3 grid gap-3">
                      {alert.websiteUrl ? (
                        <div className="rounded-[18px] border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
                          Website: {alert.websiteUrl}
                        </div>
                      ) : null}
                      {alert.googleBusinessProfileUrl ? (
                        <div className="rounded-[18px] border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
                          Google profile: {alert.googleBusinessProfileUrl}
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        Updated {formatDateTime(alert.updatedAt)}
                      </p>
                      <Button asChild variant="ghost" className="rounded-full px-4">
                        <Link href={`/workspace/clients/${alert.businessId}`}>
                          Open company
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <WorkspaceEmptyState
                className="mt-4"
                title="No insecure stored links found"
                description="The current workspace data is not showing businesses with obvious HTTP links that should be upgraded to HTTPS."
              />
            )}
          </div>
        </div>
      </WorkspaceSection>
    </div>
  );
}
