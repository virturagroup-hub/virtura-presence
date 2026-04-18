"use client";

import { useMemo, useState, useTransition } from "react";
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
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  WorkspaceActionFooter,
  WorkspaceChip,
  WorkspaceEmptyState,
  WorkspaceField,
  WorkspaceInput,
  WorkspaceSection,
  WorkspaceSelect,
  WorkspaceTextarea,
} from "@/components/workspace/workspace-primitives";

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
  availablePlans: Array<{ slug: string; name: string; tierLabel: string }>;
  canUnpublish: boolean;
};

const evidenceStageLabels: Record<AuditEvidenceStage, string> = {
  BEFORE: "Before",
  AFTER: "After",
  PROGRESS: "Progress",
  REFERENCE: "Reference",
};

const insetPanelClass =
  "rounded-[24px] border border-slate-200/70 bg-white/92 p-4 shadow-[0_22px_45px_-38px_rgba(15,23,42,0.22)]";

const mutedInsetPanelClass = "rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4";

export function AuditEditorForm(props: AuditEditorFormProps) {
  const {
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
  } = props;

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

  const setSectionValue = (
    category: AuditCategory,
    field: keyof AuditSectionDraft,
    value: string | number,
  ) =>
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.category === category ? { ...section, [field]: value } : section,
      ),
    }));

  const togglePlan = (slug: string) =>
    setDraft((current) => ({
      ...current,
      selectedPlanSlugs: current.selectedPlanSlugs.includes(slug)
        ? current.selectedPlanSlugs.filter((item) => item !== slug)
        : [...current.selectedPlanSlugs, slug],
    }));

  const addChecklistItem = (category: AuditCategory) =>
    setDraft((current) => ({
      ...current,
      checklistItems: [
        ...current.checklistItems,
        { category, title: "", status: AuditChecklistStatus.NOT_STARTED, notes: "", recommendation: "" },
      ],
    }));

  const addEvidence = (category: AuditCategory) =>
    setDraft((current) => ({
      ...current,
      evidence: [
        ...current.evidence,
        { category, label: "", assetUrl: "", notes: "", stage: AuditEvidenceStage.REFERENCE, clientVisible: false },
      ],
    }));

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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="section-kicker">Audit studio</p>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-slate-950">
            Draft, refine, and publish the consultant review
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <WorkspaceChip active>{status.replaceAll("_", " ")}</WorkspaceChip>
          <WorkspaceChip>{auditScopeLabels[draft.scope]}</WorkspaceChip>
        </div>
      </div>

      {draftAssist.length ? (
        <WorkspaceSection
          kicker="AI-assisted drafting cues"
          description="Grounding prompts pulled from the latest submission and request context."
          tone="brand"
        >
          <div className="grid gap-3">
            {draftAssist.map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/80 bg-white/92 px-4 py-4 text-sm leading-7 text-slate-700"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-1 size-4 shrink-0 text-brand-600" />
                  <span>{item}</span>
                </div>
              </div>
            ))}
          </div>
        </WorkspaceSection>
      ) : null}

      <WorkspaceSection
        kicker="Audit setup"
        title="Align scope, progress, and implementation direction"
        tone="muted"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className={insetPanelClass}>
            <WorkspaceField label="Audit scope" helper="Choose whether this is a free review or a deeper comprehensive audit.">
              <WorkspaceSelect
                value={draft.scope}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    scope: event.target.value as AuditScope,
                  }))
                }
              >
                {Object.entries(auditScopeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </WorkspaceSelect>
            </WorkspaceField>
          </div>
          <div className={insetPanelClass}>
            <WorkspaceField label="Progress percent" helper="Keep the studio honest about how complete the review is right now.">
              <WorkspaceInput
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
              />
            </WorkspaceField>
          </div>
          <div className={insetPanelClass}>
            <WorkspaceField label="Implementation path" helper="Clarify whether Virtura recommends DIY, hybrid support, or done-for-you delivery.">
              <WorkspaceSelect
                value={draft.implementationRecommendation}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    implementationRecommendation:
                      event.target.value as ImplementationRecommendation,
                  }))
                }
              >
                {Object.entries(implementationRecommendationLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </WorkspaceSelect>
            </WorkspaceField>
          </div>
          <div className={insetPanelClass}>
            <WorkspaceField label="Implementation notes" helper="Capture any scope nuance the consultant wants carried into the final report.">
              <WorkspaceInput
                value={draft.implementationNotes}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    implementationNotes: event.target.value,
                  }))
                }
                placeholder="DIY, hybrid, or done-for-you context"
              />
            </WorkspaceField>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection kicker="Report foundation" title="Shape the title and summary stack">
        <div className="space-y-5">
          <WorkspaceField label="Audit title">
            <WorkspaceInput
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Audit title"
            />
          </WorkspaceField>

          <div className="grid gap-4 2xl:grid-cols-3 2xl:items-start">
            {[
              {
                label: "Executive summary",
                value: draft.executiveSummary,
                onChange: (value: string) =>
                  setDraft((current) => ({ ...current, executiveSummary: value })),
                placeholder: "Executive summary",
              },
              {
                label: "Client-facing summary",
                value: draft.clientSummary,
                onChange: (value: string) =>
                  setDraft((current) => ({ ...current, clientSummary: value })),
                placeholder: "Client-facing summary",
              },
              {
                label: "Internal consultant summary",
                value: draft.internalSummary,
                onChange: (value: string) =>
                  setDraft((current) => ({ ...current, internalSummary: value })),
                placeholder: "Internal-only consultant summary",
              },
            ].map((field) => (
              <div
                key={field.label}
                className={cn(mutedInsetPanelClass, "h-full")}
              >
                <WorkspaceField label={field.label}>
                  <WorkspaceTextarea
                    rows={5}
                    className="min-h-[176px]"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    placeholder={field.placeholder}
                  />
                </WorkspaceField>
              </div>
            ))}
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        kicker="Action framing"
        title="Capture strengths, gaps, next steps, and the action plan"
        tone="muted"
      >
        <div className="grid gap-4 2xl:grid-cols-2">
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
              <div
                key={field.label}
                className={cn(insetPanelClass, "h-full")}
              >
                <WorkspaceField label={field.label}>
                  <WorkspaceTextarea
                    rows={5}
                    className="min-h-[168px]"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    placeholder="One item per line"
                />
              </WorkspaceField>
            </div>
          ))}
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        kicker="Category review"
        title="Review each category with notes, checklist context, and evidence"
        tone="muted"
      >
        <div
          role="tablist"
          aria-label="Audit categories"
          className="grid gap-2 rounded-[24px] border border-slate-200/70 bg-white/92 p-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
        >
          {draft.sections.map((section) => {
            const isActive = section.category === activeCategory;

            return (
              <button
                key={section.category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(section.category)}
                className={cn(
                  "min-h-[52px] rounded-[18px] border px-4 py-3 text-left text-[10px] font-semibold leading-5 tracking-[0.12em] uppercase transition",
                  isActive
                    ? "border-brand-200 bg-brand-50 text-brand-700 shadow-[0_18px_38px_-28px_rgba(47,111,228,0.35)]"
                    : "border-transparent bg-white/90 text-slate-500 hover:border-brand-100 hover:text-slate-700",
                )}
              >
                {categoryLabelFromKey(section.category)}
              </button>
            );
          })}
        </div>

        {draft.sections
          .filter((section) => section.category === activeCategory)
          .map((section) => (
            <div
              key={section.category}
              role="tabpanel"
              className="mt-6 space-y-5"
            >
              <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] 2xl:grid-cols-[200px_minmax(0,1fr)]">
                <div className={insetPanelClass}>
                  <WorkspaceField label="Section score" helper="Use this to reflect how strong this category is today, not how strong it could become later.">
                    <WorkspaceInput
                      type="number"
                      min={0}
                      max={20}
                      className="text-lg font-semibold"
                      value={section.score}
                      onChange={(event) =>
                        setSectionValue(
                          section.category,
                          "score",
                          Number(event.target.value || 0),
                        )
                      }
                    />
                  </WorkspaceField>
                </div>
                <div className={insetPanelClass}>
                  <WorkspaceField label="Section headline" helper="Keep the section heading direct enough that a client immediately understands the takeaway.">
                    <WorkspaceInput
                      value={section.headline}
                      onChange={(event) =>
                        setSectionValue(section.category, "headline", event.target.value)
                      }
                      placeholder="Headline"
                    />
                  </WorkspaceField>
                </div>
              </div>

              <div className="grid gap-4 2xl:grid-cols-2 2xl:items-start">
                <div className={cn(insetPanelClass, "h-full")}>
                  <WorkspaceField label="Client-facing notes" helper="What the client should read in the published report for this category.">
                    <WorkspaceTextarea
                      rows={5}
                      className="min-h-[176px]"
                      value={section.clientFacingNotes}
                      onChange={(event) =>
                        setSectionValue(
                          section.category,
                          "clientFacingNotes",
                          event.target.value,
                        )
                      }
                      placeholder="Client-facing notes"
                    />
                  </WorkspaceField>
                </div>
                <div className={cn(insetPanelClass, "h-full")}>
                  <WorkspaceField label="Internal consultant notes" helper="Anything the consultant wants to keep internal while shaping the action plan.">
                    <WorkspaceTextarea
                      rows={5}
                      className="min-h-[176px]"
                      value={section.internalNotes}
                      onChange={(event) =>
                        setSectionValue(section.category, "internalNotes", event.target.value)
                      }
                      placeholder="Internal-only consultant notes"
                    />
                  </WorkspaceField>
                </div>
              </div>

              <div className="grid items-start gap-5 min-[1700px]:grid-cols-[1.08fr_0.92fr]">
                <div className={insetPanelClass}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                        Checklist workflow
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Track what was checked and what needs attention.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => addChecklistItem(section.category)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {activeChecklistItems.length ? (
                      activeChecklistItems.map((item, index) => (
                        <div
                          key={`${section.category}-${index}`}
                          className="rounded-[22px] border border-slate-200/70 bg-slate-50/85 p-4 shadow-[0_18px_36px_-34px_rgba(15,23,42,0.22)]"
                        >
                          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                            <WorkspaceInput
                              value={item.title}
                              onChange={(event) =>
                                updateChecklistItem(
                                  section.category,
                                  index,
                                  "title",
                                  event.target.value,
                                )
                              }
                              placeholder="Checklist item"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-lg"
                              className="shrink-0 rounded-full"
                              onClick={() => removeChecklistItem(section.category, index)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>

                          <div className="mt-4 grid min-w-0 gap-3 2xl:grid-cols-[220px_minmax(0,1fr)]">
                            <WorkspaceSelect
                              value={item.status}
                              onChange={(event) =>
                                updateChecklistItem(
                                  section.category,
                                  index,
                                  "status",
                                  event.target.value,
                                )
                              }
                            >
                              {Object.entries(auditChecklistStatusLabels).map(
                                ([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ),
                              )}
                            </WorkspaceSelect>
                            <WorkspaceInput
                              value={item.recommendation}
                              onChange={(event) =>
                                updateChecklistItem(
                                  section.category,
                                  index,
                                  "recommendation",
                                  event.target.value,
                                )
                              }
                              placeholder="Recommendation"
                            />
                          </div>

                          <WorkspaceTextarea
                            rows={3}
                            className="mt-4 min-h-[118px]"
                            value={item.notes}
                            onChange={(event) =>
                              updateChecklistItem(
                                section.category,
                                index,
                                "notes",
                                event.target.value,
                              )
                            }
                            placeholder="Consultant notes"
                          />
                        </div>
                      ))
                    ) : (
                      <WorkspaceEmptyState
                        title="No checklist items yet"
                        description="Add the first review item so this section has a concrete consultant workflow."
                        className="min-h-[220px] flex flex-col justify-center"
                        action={
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => addChecklistItem(section.category)}
                          >
                            Add checklist item
                          </Button>
                        }
                      />
                    )}
                  </div>
                </div>

                <div className={insetPanelClass}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                        Evidence and screenshots
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Keep proof and references attached to the right section.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => addEvidence(section.category)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {activeEvidence.length ? (
                      activeEvidence.map((item, index) => (
                        <div
                          key={`${section.category}-evidence-${index}`}
                          className="rounded-[22px] border border-slate-200/70 bg-slate-50/85 p-4 shadow-[0_18px_36px_-34px_rgba(15,23,42,0.2)]"
                        >
                          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                            <WorkspaceInput
                              value={item.label}
                              onChange={(event) =>
                                updateEvidenceItem(
                                  section.category,
                                  index,
                                  "label",
                                  event.target.value,
                                )
                              }
                              placeholder="Evidence label"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-lg"
                              className="shrink-0 rounded-full"
                              onClick={() => removeEvidenceItem(section.category, index)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>

                          <div className="mt-4 grid min-w-0 gap-3 2xl:grid-cols-[180px_minmax(0,1fr)]">
                            <WorkspaceSelect
                              value={item.stage}
                              onChange={(event) =>
                                updateEvidenceItem(
                                  section.category,
                                  index,
                                  "stage",
                                  event.target.value,
                                )
                              }
                            >
                              {Object.entries(evidenceStageLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </WorkspaceSelect>
                            <WorkspaceInput
                              value={item.assetUrl}
                              onChange={(event) =>
                                updateEvidenceItem(
                                  section.category,
                                  index,
                                  "assetUrl",
                                  event.target.value,
                                )
                              }
                              placeholder="Screenshot URL or reference path"
                            />
                          </div>

                          <WorkspaceTextarea
                            rows={3}
                            className="mt-4 min-h-[118px]"
                            value={item.notes}
                            onChange={(event) =>
                              updateEvidenceItem(
                                section.category,
                                index,
                                "notes",
                                event.target.value,
                              )
                            }
                            placeholder="Why this reference matters"
                          />

                          <label className="mt-4 flex items-center gap-3 rounded-[18px] border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-slate-700">
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
                      ))
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/82 px-5 py-6 text-center">
                        <p className="text-sm font-semibold text-slate-950">
                          No evidence references yet
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          Add a before, after, progress, or reference item so this section has
                          proof attached to the written review.
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          {Object.values(evidenceStageLabels).map((label) => (
                            <WorkspaceChip key={label}>{label}</WorkspaceChip>
                          ))}
                        </div>
                        <div className="mt-5 flex justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => addEvidence(section.category)}
                          >
                            Add evidence item
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </WorkspaceSection>

      <WorkspaceSection
        kicker="Recommended service plans"
        title="Align recommendations with the visible gaps"
      >
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            {availablePlans.map((plan) => {
              const selected = draft.selectedPlanSlugs.includes(plan.slug);

              return (
                <button
                  key={plan.slug}
                  type="button"
                  onClick={() => togglePlan(plan.slug)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    selected
                      ? "border-brand-200 bg-brand-50 text-brand-700 shadow-[0_16px_36px_-26px_rgba(47,111,228,0.45)]"
                      : "border-slate-200/80 bg-white/95 text-slate-700 hover:border-brand-200 hover:text-brand-700",
                  )}
                >
                  {plan.name}
                </button>
              );
            })}
          </div>

          <WorkspaceField
            label="Recommendation rationale"
            helper="Explain why these plans fit this business so the recommendation feels grounded instead of generic."
          >
            <WorkspaceTextarea
              rows={4}
              className="min-h-[136px]"
              value={draft.serviceRecommendationRationale}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  serviceRecommendationRationale: event.target.value,
                }))
              }
              placeholder="Why do these recommendations fit this business?"
            />
          </WorkspaceField>
        </div>
      </WorkspaceSection>

      <WorkspaceActionFooter
        title="Finalization controls"
        description="Save the working draft, mark it ready, or publish the client-safe report when the review is complete."
      >
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => submit("save")}
          disabled={isPending}
          className="rounded-full px-5"
        >
          {isPending ? "Working..." : "Save draft"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => submit("ready")}
          disabled={isPending}
          className="rounded-full border border-brand-200 bg-brand-50 px-5 text-brand-700 hover:bg-brand-100"
        >
          Mark ready
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={() => submit("publish")}
          disabled={isPending}
          className="rounded-full px-5"
        >
          Publish audit
        </Button>
        {canUnpublish ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => submit("unpublish")}
            disabled={isPending}
            className="rounded-full border-amber-200 bg-amber-50 px-5 text-amber-700 hover:bg-amber-100"
          >
            Return to internal review
          </Button>
        ) : null}
      </WorkspaceActionFooter>
    </div>
  );
}
