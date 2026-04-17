import {
  AuditCategory,
  AuditChecklistStatus,
  AuditEvidenceStage,
  AuditScope,
  AuditStatus,
  BusinessLifecycleStage,
  ImplementationRecommendation,
  SubmissionStatus,
} from "@prisma/client";
import { z } from "zod";

const optionalTextSchema = z.string().optional().default("");

export const auditEditorSectionSchema = z.object({
  category: z.nativeEnum(AuditCategory),
  score: z.coerce.number().min(0).max(20),
  headline: z.string().min(3, "Add a category headline."),
  clientFacingNotes: z
    .string()
    .min(12, "Client-facing notes should be clear enough to be useful."),
  internalNotes: optionalTextSchema,
});

export const auditChecklistItemSchema = z.object({
  category: z.nativeEnum(AuditCategory),
  title: z.string().min(3, "Add a checklist item."),
  status: z.nativeEnum(AuditChecklistStatus),
  notes: optionalTextSchema,
  recommendation: optionalTextSchema,
});

export const auditEvidenceSchema = z.object({
  category: z.nativeEnum(AuditCategory).nullable().optional(),
  label: z.string().min(2, "Add a short evidence label."),
  assetUrl: optionalTextSchema,
  notes: optionalTextSchema,
  stage: z.nativeEnum(AuditEvidenceStage),
  clientVisible: z.boolean().default(false),
});

export const auditEditorSchema = z.object({
  submissionId: z.string().min(1),
  intent: z.enum(["save", "ready", "publish", "unpublish"]),
  scope: z.nativeEnum(AuditScope),
  progressPercent: z.coerce.number().min(0).max(100),
  implementationRecommendation: z.nativeEnum(ImplementationRecommendation),
  implementationNotes: optionalTextSchema,
  title: z.string().min(3, "Add an audit title."),
  executiveSummary: optionalTextSchema,
  clientSummary: optionalTextSchema,
  internalSummary: optionalTextSchema,
  strengthsText: optionalTextSchema,
  improvementText: optionalTextSchema,
  nextStepsText: optionalTextSchema,
  actionPlanText: optionalTextSchema,
  sections: z
    .array(auditEditorSectionSchema)
    .min(5, "All audit categories should be present."),
  checklistItems: z.array(auditChecklistItemSchema).default([]),
  evidence: z.array(auditEvidenceSchema).default([]),
  selectedPlanSlugs: z.array(z.string()).default([]),
  serviceRecommendationRationale: optionalTextSchema,
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

export const businessLifecycleUpdateSchema = z.object({
  businessId: z.string().min(1),
  lifecycleStage: z.nativeEnum(BusinessLifecycleStage),
});

export type BusinessLifecycleUpdateInput = z.infer<
  typeof businessLifecycleUpdateSchema
>;

export const workspaceNotificationActionSchema = z.object({
  businessId: z.string().min(1),
  submissionId: z.string().optional(),
  kind: z.enum([
    "quick_report",
    "audit_available",
    "follow_up",
    "comprehensive_ready",
  ]),
});

export type WorkspaceNotificationActionInput = z.infer<
  typeof workspaceNotificationActionSchema
>;

export const workspaceAuditStateForIntent: Record<
  AuditEditorInput["intent"],
  AuditStatus
> = {
  save: AuditStatus.DRAFT,
  ready: AuditStatus.READY_TO_PUBLISH,
  publish: AuditStatus.PUBLISHED,
  unpublish: AuditStatus.INTERNAL_REVIEW,
};
