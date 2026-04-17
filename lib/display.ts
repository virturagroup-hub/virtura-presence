import {
  AuditCategory,
  AuditChecklistStatus,
  AuditScope,
  BusinessLifecycleStage,
  ComprehensiveReportRequestStatus,
  ImplementationRecommendation,
  ScoreTier,
  SubmissionStatus,
  type FollowUpStatus,
} from "@prisma/client";

export const auditCategoryLabels: Record<AuditCategory, string> = {
  WEBSITE_PRESENCE: "Website Presence",
  GOOGLE_LOCAL_PRESENCE: "Google / Local Presence",
  REVIEWS_TRUST: "Reviews & Trust",
  SOCIAL_BRAND_ACTIVITY: "Social Presence / Brand Activity",
  CUSTOMER_ACTION_READINESS: "Customer Action Readiness",
};

export const scoreTierLabels: Record<ScoreTier, string> = {
  LIMITED_FOUNDATION: "Limited online foundation",
  EARLY_STAGE_PRESENCE: "Early-stage presence",
  BASIC_FOUNDATION_CLEAR_GAPS: "Basic foundation with clear gaps",
  SOLID_FOUNDATION_IMPROVEMENTS: "Solid foundation with improvement opportunities",
  STRONG_ONLINE_PRESENCE: "Strong online presence",
};

export const submissionStatusLabels: Record<SubmissionStatus, string> = {
  SUBMITTED: "Submitted",
  AWAITING_REVIEW: "Awaiting review",
  IN_REVIEW: "In review",
  PUBLISHED: "Published",
  FOLLOW_UP_SENT: "Follow-up sent",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

export const followUpStatusLabels: Record<FollowUpStatus, string> = {
  QUEUED: "Queued",
  SCHEDULED: "Scheduled",
  SENT: "Sent",
  REPLIED: "Replied",
  BOOKED: "Booked",
  CLOSED: "Closed",
};

export const businessLifecycleLabels: Record<BusinessLifecycleStage, string> = {
  LEAD: "Lead",
  FREE_AUDIT_REQUESTED: "Free audit requested",
  FREE_AUDIT_REVIEWED: "Free audit reviewed",
  COMPREHENSIVE_AUDIT_REQUESTED: "Comprehensive audit requested",
  COMPREHENSIVE_AUDIT_IN_PROGRESS: "Comprehensive audit in progress",
  AUDIT_PUBLISHED: "Audit published",
  FOLLOW_UP_SENT: "Follow-up sent",
  CONVERTED: "Converted",
  ONGOING_CARE: "Ongoing care",
  CLOSED_INACTIVE: "Closed / inactive",
};

export const comprehensiveRequestStatusLabels: Record<
  ComprehensiveReportRequestStatus,
  string
> = {
  REQUESTED: "Requested",
  ACKNOWLEDGED: "Acknowledged",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  DECLINED: "Declined",
};

export const auditScopeLabels: Record<AuditScope, string> = {
  FREE_REVIEW: "Free review",
  COMPREHENSIVE: "Comprehensive",
};

export const auditChecklistStatusLabels: Record<AuditChecklistStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETE: "Complete",
  NEEDS_ATTENTION: "Needs attention",
};

export const implementationRecommendationLabels: Record<
  ImplementationRecommendation,
  string
> = {
  DIY: "DIY-friendly",
  DONE_FOR_YOU: "Done for you",
  HYBRID: "Hybrid support",
  CONSULTATION: "Consultation first",
};

export function categoryLabelFromKey(key: AuditCategory) {
  return auditCategoryLabels[key];
}

export function submissionStatusLabel(status: SubmissionStatus) {
  return submissionStatusLabels[status];
}

export function scoreTierLabel(tier: ScoreTier | null | undefined) {
  if (!tier) {
    return null;
  }

  return scoreTierLabels[tier];
}

export function businessLifecycleLabel(
  lifecycle: BusinessLifecycleStage | null | undefined,
) {
  if (!lifecycle) {
    return null;
  }

  return businessLifecycleLabels[lifecycle];
}

export function comprehensiveRequestStatusLabel(
  status: ComprehensiveReportRequestStatus | null | undefined,
) {
  if (!status) {
    return null;
  }

  return comprehensiveRequestStatusLabels[status];
}

export function auditScopeLabel(scope: AuditScope | null | undefined) {
  if (!scope) {
    return null;
  }

  return auditScopeLabels[scope];
}

export function auditChecklistStatusLabel(
  status: AuditChecklistStatus | null | undefined,
) {
  if (!status) {
    return null;
  }

  return auditChecklistStatusLabels[status];
}

export function implementationRecommendationLabel(
  value: ImplementationRecommendation | null | undefined,
) {
  if (!value) {
    return null;
  }

  return implementationRecommendationLabels[value];
}
