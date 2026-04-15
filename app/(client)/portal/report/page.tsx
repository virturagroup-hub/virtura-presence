import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AuditCategoryBlock } from "@/components/shared/audit-category-block";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { categoryLabelFromKey } from "@/lib/display";
import { getPortalDashboardData } from "@/lib/data/portal";

export default async function PortalReportPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return null;
  }

  const portal = await getPortalDashboardData(user.id);
  const publishedSubmission = portal.submissions.find(
    (submission) => submission.audit?.status === "PUBLISHED",
  );
  const publishedAudit = publishedSubmission?.audit;

  if (!publishedSubmission || !publishedAudit) {
    return (
      <div className="surface-card p-8">
        <p className="section-kicker">Published report</p>
        <h2 className="mt-4 font-heading text-4xl font-semibold text-slate-950">
          A consultant-reviewed audit is not published yet.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Your quick score is still available in the portal. Once the consultant review
          is published, the full client-safe audit will appear here automatically.
        </p>
        <Button asChild className="mt-6 rounded-full px-5">
          <Link href="/portal">
            Back to overview
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <p className="section-kicker">Published manual audit</p>
        <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
          Consultant-reviewed findings for {publishedSubmission.businessName}
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
          {publishedAudit.clientSummary ??
            "Your manual audit is published. Review the sections below for the clearest strengths, improvement opportunities, and next steps."}
        </p>
        <p className="mt-4 text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
          Published {formatDate(publishedAudit.publishedAt)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {publishedAudit.strengths.map((item) => (
          <div key={item} className="rounded-[28px] border border-emerald-100 bg-emerald-50/80 p-5">
            <p className="text-sm leading-7 text-emerald-900">{item}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5">
        {publishedAudit.sections.map((section) => (
          <AuditCategoryBlock
            key={section.category}
            category={categoryLabelFromKey(section.category)}
            score={section.score ?? 0}
            headline={section.headline}
            clientNotes={section.clientFacingNotes}
          />
        ))}
      </div>

      {publishedAudit.nextSteps.length ? (
        <div className="surface-card p-6">
          <p className="section-kicker">Recommended next steps</p>
          <div className="mt-5 space-y-3">
            {publishedAudit.nextSteps.map((step) => (
              <div
                key={step}
                className="rounded-[24px] border border-slate-200/70 bg-white/88 px-4 py-4 text-sm leading-7 text-slate-700"
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
