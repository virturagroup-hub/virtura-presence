import { AuditCategory, AuditStatus, SubmissionStatus } from "@prisma/client";
import { z } from "zod";

export const auditEditorSectionSchema = z.object({
  category: z.nativeEnum(AuditCategory),
  score: z.coerce.number().min(0).max(20),
  headline: z.string().min(3, "Add a category headline."),
  clientFacingNotes: z
    .string()
    .min(12, "Client-facing notes should be clear enough to be useful."),
  internalNotes: z.string().optional(),
});

export const auditEditorSchema = z.object({
  submissionId: z.string().min(1),
  intent: z.enum(["save", "ready", "publish", "unpublish"]),
  title: z.string().min(3, "Add an audit title."),
  executiveSummary: z.string().optional(),
  clientSummary: z.string().optional(),
  internalSummary: z.string().optional(),
  strengthsText: z.string().optional(),
  improvementText: z.string().optional(),
  nextStepsText: z.string().optional(),
  sections: z
    .array(auditEditorSectionSchema)
    .min(5, "All audit categories should be present."),
  selectedPlanSlugs: z.array(z.string()).default([]),
  serviceRecommendationRationale: z.string().optional(),
});

export type AuditEditorInput = z.infer<typeof auditEditorSchema>;

export const submissionStatusUpdateSchema = z.object({
  submissionId: z.string().min(1),
  status: z.nativeEnum(SubmissionStatus),
});

export type SubmissionStatusUpdateInput = z.infer<
  typeof submissionStatusUpdateSchema
>;

export const internalNoteSchema = z.object({
  submissionId: z.string().min(1),
  title: z.string().optional(),
  body: z.string().min(4, "Add a short internal note."),
});

export type InternalNoteInput = z.infer<typeof internalNoteSchema>;

export const workspaceAuditStateForIntent: Record<
  AuditEditorInput["intent"],
  AuditStatus
> = {
  save: AuditStatus.DRAFT,
  ready: AuditStatus.READY_TO_PUBLISH,
  publish: AuditStatus.PUBLISHED,
  unpublish: AuditStatus.INTERNAL_REVIEW,
};
