import {
  AuditCategory,
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
