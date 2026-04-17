import {
  AdvertisingCadence,
  AuditCategory,
  AuditChecklistStatus,
  GoogleBusinessProfileStatus,
  ReviewRequestCadence,
  ReviewStrength,
  SocialPresenceLevel,
  WebsiteStatus,
} from "@prisma/client";

import { categoryLabelFromKey } from "@/lib/display";

export const auditChecklistTemplates: Record<
  AuditCategory,
  Array<{ title: string; recommendation: string }>
> = {
  WEBSITE_PRESENCE: [
    {
      title: "Homepage clearly explains who the business serves and what it does",
      recommendation: "Clarify the main service promise in the first screenful.",
    },
    {
      title: "Primary calls to action are easy to find on desktop and mobile",
      recommendation: "Move core contact actions closer to trust-building proof.",
    },
    {
      title: "Trust signals appear near service and contact decisions",
      recommendation: "Place reviews, guarantees, or credentials near decision points.",
    },
  ],
  GOOGLE_LOCAL_PRESENCE: [
    {
      title: "Profile categories and services reflect the real business accurately",
      recommendation: "Tighten category selection and service coverage.",
    },
    {
      title: "Business profile details, photos, and hours look current",
      recommendation: "Refresh stale details and publish current photos.",
    },
    {
      title: "Local profile reinforces trust instead of feeling incomplete",
      recommendation: "Fill common proof gaps such as descriptions, service area, and contact paths.",
    },
  ],
  REVIEWS_TRUST: [
    {
      title: "The business has a review base customers can actually see",
      recommendation: "Strengthen visible review proof where trust is still thin.",
    },
    {
      title: "A repeatable review-request habit exists",
      recommendation: "Create a simple review ask tied to completed work or happy customers.",
    },
    {
      title: "Review sentiment and volume support buyer confidence",
      recommendation: "Focus on consistency before chasing volume for its own sake.",
    },
  ],
  SOCIAL_BRAND_ACTIVITY: [
    {
      title: "Social channels reinforce that the business is active and credible",
      recommendation: "Use fewer channels better instead of spreading effort thinly.",
    },
    {
      title: "Brand presentation looks reasonably consistent across visible channels",
      recommendation: "Align bios, links, and recent proof across the most visible profiles.",
    },
    {
      title: "Recent activity gives customers confidence that the business is active",
      recommendation: "Publish low-lift updates that support trust and recency.",
    },
  ],
  CUSTOMER_ACTION_READINESS: [
    {
      title: "Customers have a clear next step no matter where they land",
      recommendation: "Reduce friction between discovery, trust, and contact actions.",
    },
    {
      title: "Contact methods, service area, and response expectations are obvious",
      recommendation: "Clarify response path and service coverage near the CTA.",
    },
    {
      title: "The online presence supports calls, leads, or bookings without confusion",
      recommendation: "Tighten the journey from proof to action.",
    },
  ],
};

export function buildDefaultChecklistItems() {
  return Object.entries(auditChecklistTemplates).flatMap(([category, items]) =>
    items.map((item) => ({
      category: category as AuditCategory,
      title: item.title,
      status: AuditChecklistStatus.NOT_STARTED,
      notes: "",
      recommendation: item.recommendation,
    })),
  );
}

export function buildAuditDraftAssist(input: {
  businessName: string;
  websiteStatus?: WebsiteStatus | null;
  googleBusinessProfileStatus?: GoogleBusinessProfileStatus | null;
  reviewStrength?: ReviewStrength | null;
  reviewRequestCadence?: ReviewRequestCadence | null;
  socialPresenceLevel?: SocialPresenceLevel | null;
  runsAdvertising?: AdvertisingCadence | null;
  lowestCategories?: Array<{ category: AuditCategory; score: number }>;
  comprehensiveRequestNote?: string | null;
}) {
  const prompts: string[] = [];

  if (!input.websiteStatus || input.websiteStatus === WebsiteStatus.NONE) {
    prompts.push(
      `${input.businessName} has no live website, so the audit should treat website clarity and contact readiness as a primary gap rather than a secondary polish item.`,
    );
  } else if (input.websiteStatus === WebsiteStatus.IN_PROGRESS) {
    prompts.push(
      `${input.businessName} is still mid-launch online. Keep website recommendations practical and staged so the owner can see what matters before polishing details.`,
    );
  }

  if (
    !input.googleBusinessProfileStatus ||
    input.googleBusinessProfileStatus === GoogleBusinessProfileStatus.NONE ||
    input.googleBusinessProfileStatus === GoogleBusinessProfileStatus.NOT_SURE
  ) {
    prompts.push(
      "Google / local presence is either missing or uncertain, so the report should treat local discoverability as a foundational gap.",
    );
  }

  if (
    (!input.reviewStrength || input.reviewStrength === ReviewStrength.NONE) &&
    (!input.reviewRequestCadence ||
      input.reviewRequestCadence === ReviewRequestCadence.NEVER)
  ) {
    prompts.push(
      "Reviews and trust are thin right now. Recommendations should focus on building a repeatable, realistic review engine instead of overpromising quick reputation wins.",
    );
  }

  if (
    !input.socialPresenceLevel ||
    input.socialPresenceLevel === SocialPresenceLevel.NONE
  ) {
    prompts.push(
      "Social presence is limited or absent. Keep any brand-activity recommendations lightweight and aligned to channels the business can actually maintain.",
    );
  }

  if (input.runsAdvertising === AdvertisingCadence.NO) {
    prompts.push(
      "This business is not running ads, so the plan should prioritize trust, clarity, and visibility fundamentals before suggesting paid traffic.",
    );
  }

  input.lowestCategories?.slice(0, 2).forEach((category) => {
    prompts.push(
      `${categoryLabelFromKey(category.category)} is one of the weakest visible areas right now. Make sure the action plan includes a focused fix, not just a description of the problem.`,
    );
  });

  if (input.comprehensiveRequestNote?.trim()) {
    prompts.push(
      `Client request context: ${input.comprehensiveRequestNote.trim()}`,
    );
  }

  return prompts;
}
