"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AuditCategory,
  AuditChecklistStatus,
  AuditEvidenceStage,
  AuditScope,
  AuditStatus,
  ImplementationRecommendation,
} from "@prisma/client";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { saveSubmissionAuditAction } from "@/lib/actions/workspace";
import {
  auditChecklistStatusLabels,
  auditScopeLabels,
  categoryLabelFromKey,
  implementationRecommendationLabels,
} from "@/lib/display";
import { joinLineItems } from "@/lib/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuditSectionDraft = {
  category: AuditCategory;
  score: number;
  headline: string;
  clientFacingNotes: string;
  internalNotes: string;
};

type ChecklistItemDraft = {
  category: AuditCategory;
  title: string;
  status: AuditChecklistStatus;
  notes: string;
  recommendation: string;
};

type EvidenceItemDraft = {
  category: AuditCategory | null;
  label: string;
  assetUrl: string;
  notes: string;
  stage: AuditEvidenceStage;
  clientVisible: boolean;
};

type AuditEditorFormProps = {
  submissionId: string;
  status: AuditStatus;
  scope: AuditScope;
  progressPercent: number;
  implementationRecommendation: ImplementationRecommendation;
  implementationNotes: string;
  draftAssist?: string[];
  title: string;
  executiveSummary: string;
  clientSummary: string;
  internalSummary: string;
  strengths: string[];
  improvementOpportunities: string[];
  nextSteps: string[];
  actionPlan: string[];
  sections: AuditSectionDraft[];
  checklistItems: ChecklistItemDraft[];
  evidence: EvidenceItemDraft[];
  selectedPlanSlugs: string[];
  serviceRecommendationRationale: string;
  availablePlans: Array<{
    slug: string;
    name: string;
    tierLabel: string;
  }>;
  canUnpublish: boolean;
};

const evidenceStageLabels: Record<AuditEvidenceStage, string> = {
  BEFORE: "Before",
  AFTER: "After",
  PROGRESS: "Progress",
  REFERENCE: "Reference",
};

export function AuditEditorForm({
  submissionId,
  status,
  scope,
  progressPercent,
  implementationRecommendation,
  implementationNotes,
  draftAssist = [],
  title,
  executiveSummary,
  clientSummary,
  internalSummary,
  strengths,
  improvementOpportunities,
  nextSteps,
  actionPlan,
  sections,
  checklistItems,
  evidence,
  selectedPlanSlugs,
  serviceRecommendationRationale,
  availablePlans,
  canUnpublish,
}: AuditEditorFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState({
    scope,
    progressPercent,
    implementationRecommendation,
    implementationNotes,
    title,
    executiveSummary,
    clientSummary,
    internalSummary,
    strengthsText: joinLineItems(strengths),
    improvementText: joinLineItems(improvementOpportunities),
    nextStepsText: joinLineItems(nextSteps),
    actionPlanText: joinLineItems(actionPlan),
    sections,
    checklistItems,
    evidence,
    selectedPlanSlugs,
    serviceRecommendationRationale,
  });
  const [activeCategory, setActiveCategory] = useState<AuditCategory>(
    sections[0]?.category ?? AuditCategory.WEBSITE_PRESENCE,
  );
  const [isPending, startTransition] = useTransition();

  const activeChecklistItems = useMemo(
    () => draft.checklistItems.filter((item) => item.category === activeCategory),
    [activeCategory, draft.checklistItems],
  );
  const activeEvidence = useMemo(
    () => draft.evidence.filter((item) => item.category === activeCategory),
    [activeCategory, draft.evidence],
  );

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

  function addChecklistItem(category: AuditCategory) {
    setDraft((current) => ({
      ...current,
      checklistItems: [
        ...current.checklistItems,
        {
          category,
          title: "",
          status: AuditChecklistStatus.NOT_STARTED,
          notes: "",
          recommendation: "",
        },
      ],
    }));
  }

  function updateChecklistItem(
    category: AuditCategory,
    index: number,
    field: keyof ChecklistItemDraft,
    value: string,
  ) {
    let seen = -1;
    setDraft((current) => ({
      ...current,
      checklistItems: current.checklistItems.map((item) => {
        if (item.category !== category) {
          return item;
        }

        seen += 1;
        return seen === index ? { ...item, [field]: value } : item;
      }),
    }));
  }

  function removeChecklistItem(category: AuditCategory, index: number) {
    let seen = -1;
    setDraft((current) => ({
      ...current,
      checklistItems: current.checklistItems.filter((item) => {
        if (item.category !== category) {
          return true;
        }

        seen += 1;
        return seen !== index;
      }),
    }));
  }

  function addEvidence(category: AuditCategory) {
    setDraft((current) => ({
      ...current,
      evidence: [
        ...current.evidence,
        {
          category,
          label: "",
          assetUrl: "",
          notes: "",
          stage: AuditEvidenceStage.REFERENCE,
          clientVisible: false,
        },
      ],
    }));
  }

  function updateEvidenceItem(
    category: AuditCategory,
    index: number,
    field: keyof EvidenceItemDraft,
    value: string | boolean,
  ) {
    let seen = -1;
    setDraft((current) => ({
      ...current,
      evidence: current.evidence.map((item) => {
        if (item.category !== category) {
          return item;
        }

        seen += 1;
        return seen === index ? { ...item, [field]: value } : item;
      }),
    }));
  }

  function removeEvidenceItem(category: AuditCategory, index: number) {
    let seen = -1;
    setDraft((current) => ({
      ...current,
      evidence: current.evidence.filter((item) => {
        if (item.category !== category) {
          return true;
        }

        seen += 1;
        return seen !== index;
      }),
    }));
  }

  function submit(intent: "save" | "ready" | "publish" | "unpublish") {
    startTransition(async () => {
      const response = await saveSubmissionAuditAction({
        submissionId,
        intent,
        scope: draft.scope,
        progressPercent: draft.progressPercent,
        implementationRecommendation: draft.implementationRecommendation,
        implementationNotes: draft.implementationNotes,
        title: draft.title,
        executiveSummary: draft.executiveSummary,
        clientSummary: draft.clientSummary,
        internalSummary: draft.internalSummary,
        strengthsText: draft.strengthsText,
        improvementText: draft.improvementText,
        nextStepsText: draft.nextStepsText,
        actionPlanText: draft.actionPlanText,
        sections: draft.sections,
        checklistItems: draft.checklistItems.filter((item) => item.title.trim()),
        evidence: draft.evidence.filter((item) => item.label.trim()),
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">Audit studio</p>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
            Draft, refine, and publish the consultant review
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-brand-700 uppercase">
            {status.replaceAll("_", " ")}
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold tracking-[0.22em] text-slate-700 uppercase">
            {auditScopeLabels[draft.scope]}
          </div>
        </div>
      </div>

      {draftAssist.length ? (
        <div className="rounded-[28px] border border-brand-100 bg-brand-50/75 p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-brand-600" />
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-brand-700 uppercase">
                AI-assisted drafting cues
              </p>
              <p className="mt-1 text-sm text-brand-800">
                Grounding prompts pulled from the latest submission and client request context.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {draftAssist.map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/80 bg-white/92 px-4 py-4 text-sm leading-7 text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <Field label="Audit scope">
          <select
            value={draft.scope}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                scope: event.target.value as AuditScope,
              }))
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
          >
            {Object.entries(auditScopeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Progress percent">
          <input
            type="number"
            min={0}
            max={100}
            value={draft.progressPercent}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                progressPercent: Number(event.target.value || 0),
              }))
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
          />
        </Field>

        <Field label="Implementation path">
          <select
            value={draft.implementationRecommendation}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                implementationRecommendation:
                  event.target.value as ImplementationRecommendation,
              }))
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
          >
            {Object.entries(implementationRecommendationLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Implementation notes">
          <input
            value={draft.implementationNotes}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                implementationNotes: event.target.value,
              }))
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
            placeholder="DIY, hybrid, or done-for-you context"
          />
        </Field>
      </div>

      <div className="grid gap-4">
        <input
          value={draft.title}
          onChange={(event) =>
            setDraft((current) => ({ ...current, title: event.target.value }))
          }
          className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
          placeholder="Audit title"
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <textarea
            value={draft.executiveSummary}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                executiveSummary: event.target.value,
              }))
            }
            rows={5}
            className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
            placeholder="Executive summary"
          />
          <textarea
            value={draft.clientSummary}
            onChange={(event) =>
              setDraft((current) => ({ ...current, clientSummary: event.target.value }))
            }
            rows={5}
            className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
            placeholder="Client-facing summary"
          />
          <textarea
            value={draft.internalSummary}
            onChange={(event) =>
              setDraft((current) => ({ ...current, internalSummary: event.target.value }))
            }
            rows={5}
            className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
            placeholder="Internal-only consultant summary"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
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
          {
            label: "Action plan",
            value: draft.actionPlanText,
            onChange: (value: string) =>
              setDraft((current) => ({ ...current, actionPlanText: value })),
          },
        ].map((field) => (
          <div key={field.label} className="rounded-[28px] border border-slate-200/70 bg-white/88 p-4">
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

      <div className="rounded-[30px] border border-slate-200/70 bg-slate-50/80 p-5 sm:p-6">
        <p className="section-kicker">Category review</p>
        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as AuditCategory)} className="mt-5">
          <TabsList variant="line" className="flex w-full flex-wrap rounded-[22px] bg-white/88 p-2">
            {draft.sections.map((section) => (
              <TabsTrigger
                key={section.category}
                value={section.category}
                className="rounded-full px-4 py-2 data-active:bg-brand-50 data-active:text-brand-700"
              >
                {categoryLabelFromKey(section.category)}
              </TabsTrigger>
            ))}
          </TabsList>

          {draft.sections.map((section) => (
            <TabsContent key={section.category} value={section.category} className="mt-5">
              <div className="grid gap-4 lg:grid-cols-[0.24fr_0.76fr]">
                <div className="rounded-[24px] border border-slate-200/70 bg-white/92 p-4">
                  <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                    Section score
                  </p>
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
                    className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-lg font-semibold text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                  />
                </div>

                <div className="rounded-[24px] border border-slate-200/70 bg-white/92 p-4">
                  <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                    Section headline
                  </p>
                  <input
                    value={section.headline}
                    onChange={(event) =>
                      setSectionValue(section.category, "headline", event.target.value)
                    }
                    className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                    placeholder="Headline"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <textarea
                  rows={6}
                  value={section.clientFacingNotes}
                  onChange={(event) =>
                    setSectionValue(
                      section.category,
                      "clientFacingNotes",
                      event.target.value,
                    )
                  }
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                  placeholder="Client-facing notes"
                />
                <textarea
                  rows={6}
                  value={section.internalNotes}
                  onChange={(event) =>
                    setSectionValue(section.category, "internalNotes", event.target.value)
                  }
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                  placeholder="Internal-only consultant notes"
                />
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200/70 bg-white/92 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                        Checklist workflow
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Track what was checked, what still needs attention, and what to recommend.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addChecklistItem(section.category)}
                      className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {activeChecklistItems.map((item, index) => (
                      <div
                        key={`${section.category}-${index}`}
                        className="rounded-[20px] border border-slate-200/70 bg-slate-50/80 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <input
                            value={item.title}
                            onChange={(event) =>
                              updateChecklistItem(
                                section.category,
                                index,
                                "title",
                                event.target.value,
                              )
                            }
                            className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                            placeholder="Checklist item"
                          />
                          <button
                            type="button"
                            onClick={() => removeChecklistItem(section.category, index)}
                            className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-rose-200 hover:text-rose-700"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <select
                            value={item.status}
                            onChange={(event) =>
                              updateChecklistItem(
                                section.category,
                                index,
                                "status",
                                event.target.value,
                              )
                            }
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                          >
                            {Object.entries(auditChecklistStatusLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <input
                            value={item.recommendation}
                            onChange={(event) =>
                              updateChecklistItem(
                                section.category,
                                index,
                                "recommendation",
                                event.target.value,
                              )
                            }
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                            placeholder="Recommendation"
                          />
                        </div>
                        <textarea
                          rows={3}
                          value={item.notes}
                          onChange={(event) =>
                            updateChecklistItem(
                              section.category,
                              index,
                              "notes",
                              event.target.value,
                            )
                          }
                          className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                          placeholder="Section notes"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200/70 bg-white/92 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                        Evidence and screenshots
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Store before, after, and progress references now so uploads can deepen later without changing the audit model.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addEvidence(section.category)}
                      className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {activeEvidence.map((item, index) => (
                      <div
                        key={`${section.category}-evidence-${index}`}
                        className="rounded-[20px] border border-slate-200/70 bg-slate-50/80 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <input
                            value={item.label}
                            onChange={(event) =>
                              updateEvidenceItem(
                                section.category,
                                index,
                                "label",
                                event.target.value,
                              )
                            }
                            className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                            placeholder="Evidence label"
                          />
                          <button
                            type="button"
                            onClick={() => removeEvidenceItem(section.category, index)}
                            className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-rose-200 hover:text-rose-700"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <select
                            value={item.stage}
                            onChange={(event) =>
                              updateEvidenceItem(
                                section.category,
                                index,
                                "stage",
                                event.target.value,
                              )
                            }
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                          >
                            {Object.entries(evidenceStageLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <input
                            value={item.assetUrl}
                            onChange={(event) =>
                              updateEvidenceItem(
                                section.category,
                                index,
                                "assetUrl",
                                event.target.value,
                              )
                            }
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                            placeholder="Screenshot URL or reference path"
                          />
                        </div>
                        <textarea
                          rows={3}
                          value={item.notes}
                          onChange={(event) =>
                            updateEvidenceItem(
                              section.category,
                              index,
                              "notes",
                              event.target.value,
                            )
                          }
                          className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                          placeholder="Why this reference matters"
                        />
                        <label className="mt-3 flex items-center gap-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={item.clientVisible}
                            onChange={(event) =>
                              updateEvidenceItem(
                                section.category,
                                index,
                                "clientVisible",
                                event.target.checked,
                              )
                            }
                            className="size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-300"
                          />
                          Client can see this reference
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-5">
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

      <div className="flex flex-wrap gap-3">
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

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}
