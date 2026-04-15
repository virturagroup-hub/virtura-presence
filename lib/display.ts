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
  STRONG_FOOTING: "Strong footing",
  PROMISING_UPSIDE: "Promising with clear upside",
  FOCUSED_ATTENTION: "Needs focused attention",
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
