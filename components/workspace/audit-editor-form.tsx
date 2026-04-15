"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AuditCategory, AuditStatus } from "@prisma/client";
import { toast } from "sonner";

import { saveSubmissionAuditAction } from "@/lib/actions/workspace";
import { categoryLabelFromKey } from "@/lib/display";
import { joinLineItems } from "@/lib/text";

type AuditSectionDraft = {
  category: AuditCategory;
  score: number;
  headline: string;
  clientFacingNotes: string;
  internalNotes: string;
};

type AuditEditorFormProps = {
  submissionId: string;
  status: AuditStatus;
  title: string;
  executiveSummary: string;
  clientSummary: string;
  internalSummary: string;
  strengths: string[];
  improvementOpportunities: string[];
  nextSteps: string[];
  sections: AuditSectionDraft[];
  selectedPlanSlugs: string[];
  serviceRecommendationRationale: string;
  availablePlans: Array<{
    slug: string;
    name: string;
    tierLabel: string;
  }>;
  canUnpublish: boolean;
};

export function AuditEditorForm({
  submissionId,
  status,
  title,
  executiveSummary,
  clientSummary,
  internalSummary,
  strengths,
  improvementOpportunities,
  nextSteps,
  sections,
  selectedPlanSlugs,
  serviceRecommendationRationale,
  availablePlans,
  canUnpublish,
}: AuditEditorFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState({
    title,
    executiveSummary,
    clientSummary,
    internalSummary,
    strengthsText: joinLineItems(strengths),
    improvementText: joinLineItems(improvementOpportunities),
    nextStepsText: joinLineItems(nextSteps),
    sections,
    selectedPlanSlugs,
    serviceRecommendationRationale,
  });
  const [isPending, startTransition] = useTransition();

  function setSectionValue(
    category: AuditCategory,
    field: keyof AuditSectionDraft,
    value: string | number,
  ) {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.category === category ? { ...section, [field]: value } : section,
      ),
    }));
  }

  function togglePlan(slug: string) {
    setDraft((current) => ({
      ...current,
      selectedPlanSlugs: current.selectedPlanSlugs.includes(slug)
        ? current.selectedPlanSlugs.filter((item) => item !== slug)
        : [...current.selectedPlanSlugs, slug],
    }));
  }

  function submit(intent: "save" | "ready" | "publish" | "unpublish") {
    startTransition(async () => {
      const response = await saveSubmissionAuditAction({
        submissionId,
        intent,
        title: draft.title,
        executiveSummary: draft.executiveSummary,
        clientSummary: draft.clientSummary,
        internalSummary: draft.internalSummary,
        strengthsText: draft.strengthsText,
        improvementText: draft.improvementText,
        nextStepsText: draft.nextStepsText,
        sections: draft.sections,
        selectedPlanSlugs: draft.selectedPlanSlugs,
        serviceRecommendationRationale: draft.serviceRecommendationRationale,
      });

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      toast.success(
        intent === "publish"
          ? "Audit published to the client portal."
          : intent === "ready"
            ? "Audit marked ready for publication."
            : intent === "unpublish"
              ? "Audit returned to internal review."
              : "Audit draft saved.",
      );
      router.refresh();
    });
  }

  return (
    <div className="surface-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Audit editor</p>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
            Save, refine, and publish the consultant review
          </h2>
        </div>
        <div className="rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-brand-700 uppercase">
          {status.replaceAll("_", " ")}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <input
          value={draft.title}
          onChange={(event) =>
            setDraft((current) => ({ ...current, title: event.target.value }))
          }
          className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
          placeholder="Audit title"
        />
        <textarea
          value={draft.executiveSummary}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              executiveSummary: event.target.value,
            }))
          }
          rows={3}
          className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
          placeholder="Executive summary"
        />
        <textarea
          value={draft.clientSummary}
          onChange={(event) =>
            setDraft((current) => ({ ...current, clientSummary: event.target.value }))
          }
          rows={4}
          className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
          placeholder="Client-facing summary"
        />
        <textarea
          value={draft.internalSummary}
          onChange={(event) =>
            setDraft((current) => ({ ...current, internalSummary: event.target.value }))
          }
          rows={4}
          className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
          placeholder="Internal-only consultant summary"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {[
          {
            label: "Strengths",
            value: draft.strengthsText,
            onChange: (value: string) =>
              setDraft((current) => ({ ...current, strengthsText: value })),
          },
          {
            label: "Improvement opportunities",
            value: draft.improvementText,
            onChange: (value: string) =>
              setDraft((current) => ({ ...current, improvementText: value })),
          },
          {
            label: "Recommended next steps",
            value: draft.nextStepsText,
            onChange: (value: string) =>
              setDraft((current) => ({ ...current, nextStepsText: value })),
          },
        ].map((field) => (
          <div key={field.label} className="rounded-[28px] border border-slate-200/70 bg-white/85 p-4">
            <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
              {field.label}
            </p>
            <textarea
              rows={7}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
              placeholder="One item per line"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {draft.sections.map((section) => (
          <div key={section.category} className="rounded-[28px] border border-slate-200/70 bg-white/88 p-5">
            <div className="grid gap-4 lg:grid-cols-[0.9fr_0.1fr]">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  {categoryLabelFromKey(section.category)}
                </p>
              </div>
              <input
                type="number"
                min={0}
                max={20}
                value={section.score}
                onChange={(event) =>
                  setSectionValue(
                    section.category,
                    "score",
                    Number(event.target.value || 0),
                  )
                }
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
              />
            </div>
            <input
              value={section.headline}
              onChange={(event) =>
                setSectionValue(section.category, "headline", event.target.value)
              }
              className="mt-4 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
              placeholder="Category headline"
            />
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <textarea
                rows={5}
                value={section.clientFacingNotes}
                onChange={(event) =>
                  setSectionValue(
                    section.category,
                    "clientFacingNotes",
                    event.target.value,
                  )
                }
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                placeholder="Client-facing notes"
              />
              <textarea
                rows={5}
                value={section.internalNotes}
                onChange={(event) =>
                  setSectionValue(section.category, "internalNotes", event.target.value)
                }
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                placeholder="Internal-only notes"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-5">
        <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
          Recommended service plans
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {availablePlans.map((plan) => {
            const selected = draft.selectedPlanSlugs.includes(plan.slug);

            return (
              <button
                key={plan.slug}
                type="button"
                onClick={() => togglePlan(plan.slug)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selected
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-200"
                }`}
              >
                {plan.name}
              </button>
            );
          })}
        </div>
        <textarea
          rows={4}
          value={draft.serviceRecommendationRationale}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              serviceRecommendationRationale: event.target.value,
            }))
          }
          className="mt-4 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
          placeholder="Why do these recommendations fit this business?"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => submit("save")}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-brand-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Save draft
        </button>
        <button
          type="button"
          onClick={() => submit("ready")}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-full border border-brand-200 bg-brand-50 px-5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Mark ready
        </button>
        <button
          type="button"
          onClick={() => submit("publish")}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Publish audit
        </button>
        {canUnpublish ? (
          <button
            type="button"
            onClick={() => submit("unpublish")}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Return to internal review
          </button>
        ) : null}
      </div>
    </div>
  );
}
