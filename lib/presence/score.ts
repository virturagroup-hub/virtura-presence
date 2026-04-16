import type { PresenceCheckInput } from "@/lib/validations/presence-check";

type CategoryKey =
  | "WEBSITE_PRESENCE"
  | "GOOGLE_LOCAL_PRESENCE"
  | "REVIEWS_TRUST"
  | "SOCIAL_BRAND_ACTIVITY"
  | "CUSTOMER_ACTION_READINESS";

export type QuickScoreTier =
  | "Limited online foundation"
  | "Early-stage presence"
  | "Basic foundation with clear gaps"
  | "Solid foundation with improvement opportunities"
  | "Strong online presence";

export type QuickScoreResult = {
  score: number;
  tier: QuickScoreTier;
  summary: string;
  encouragement: string;
  strengths: string[];
  improvements: string[];
  suggestedPlanSlugs: string[];
  categories: Array<{
    key: CategoryKey;
    label: string;
    score: number;
    note: string;
  }>;
};

function clampScore(score: number, max = 20) {
  return Math.max(0, Math.min(max, Math.round(score)));
}

function countCoreGaps(values: PresenceCheckInput) {
  return [
    values.websiteStatus === "none" || values.websiteStatus === "in-progress",
    values.googleBusinessProfileStatus === "none" ||
      values.googleBusinessProfileStatus === "not-sure",
    values.reviewStrength === "none" &&
      (values.reviewRequestCadence === "never" ||
        values.reviewRequestCadence === "rarely"),
  ].filter(Boolean).length;
}

function buildWebsiteCategory(values: PresenceCheckInput) {
  const base =
    values.websiteStatus === "polished"
      ? 18
      : values.websiteStatus === "mostly-complete"
        ? 14
        : values.websiteStatus === "basic"
          ? 9
          : values.websiteStatus === "in-progress"
            ? 4
            : 2;

  const liveSiteBonus =
    ["basic", "mostly-complete", "polished"].includes(values.websiteStatus) &&
    values.websiteUrl
      ? 1
      : 0;
  const cap =
    values.websiteStatus === "polished"
      ? 20
      : values.websiteStatus === "mostly-complete"
        ? 17
        : values.websiteStatus === "basic"
          ? 12
          : values.websiteStatus === "in-progress"
            ? 6
            : 4;

  const score = clampScore(base + liveSiteBonus, cap);
  const note =
    values.websiteStatus === "none"
      ? "There is no live website yet, so customers are missing a core trust and action surface."
      : values.websiteStatus === "in-progress"
        ? "The website is still in progress, so it is not yet doing dependable visibility or trust work."
        : values.websiteStatus === "basic"
          ? "A live site exists, but it still looks closer to a starting point than a strong trust asset."
          : values.websiteStatus === "mostly-complete"
            ? "The site has a credible base, but clarity, proof, and polish still have room to improve."
            : "The website is doing real credibility work already and looks close to being a strong front door.";

  return {
    key: "WEBSITE_PRESENCE" as const,
    label: "Website Presence",
    score,
    note,
  };
}

function buildLocalCategory(values: PresenceCheckInput) {
  const base =
    values.googleBusinessProfileStatus === "active"
      ? 18
      : values.googleBusinessProfileStatus === "claimed-mostly-complete"
        ? 14
        : values.googleBusinessProfileStatus === "claimed-incomplete"
          ? 8
          : values.googleBusinessProfileStatus === "not-sure"
            ? 4
            : 1;

  const liveProfileBonus =
    ["claimed-incomplete", "claimed-mostly-complete", "active"].includes(
      values.googleBusinessProfileStatus,
    ) && values.googleBusinessProfileUrl
      ? 1
      : 0;
  const cap =
    values.googleBusinessProfileStatus === "active"
      ? 20
      : values.googleBusinessProfileStatus === "claimed-mostly-complete"
        ? 16
        : values.googleBusinessProfileStatus === "claimed-incomplete"
          ? 10
          : values.googleBusinessProfileStatus === "not-sure"
            ? 6
            : 3;

  const score = clampScore(base + liveProfileBonus, cap);
  const note =
    values.googleBusinessProfileStatus === "none"
      ? "Google / local visibility is largely missing right now because there is no profile in place."
      : values.googleBusinessProfileStatus === "not-sure"
        ? "Local visibility looks uncertain, which usually means nearby discovery is weaker than it should be."
        : values.googleBusinessProfileStatus === "claimed-incomplete"
          ? "The profile exists, but it still looks incomplete enough to leave local trust on the table."
          : values.googleBusinessProfileStatus === "claimed-mostly-complete"
            ? "Local presence has a usable foundation, but it still needs steadier upkeep and completeness."
            : "Google / local presence is one of the stronger parts of the current foundation.";

  return {
    key: "GOOGLE_LOCAL_PRESENCE" as const,
    label: "Google / Local Presence",
    score,
    note,
  };
}

function buildReviewsCategory(values: PresenceCheckInput) {
  const strengthBase =
    values.reviewStrength === "strong"
      ? 15
      : values.reviewStrength === "some"
        ? 11
        : values.reviewStrength === "few"
          ? 6
          : 1;
  const cadenceBonus =
    values.reviewRequestCadence === "regularly"
      ? 4
      : values.reviewRequestCadence === "sometimes"
        ? 2
        : values.reviewRequestCadence === "rarely"
          ? 1
          : 0;
  const countBonus =
    values.reviewCount === undefined
      ? 0
      : values.reviewCount >= 50
        ? 2
        : values.reviewCount >= 15
          ? 1
          : 0;
  const ratingBonus =
    values.averageRating === undefined
      ? 0
      : values.averageRating >= 4.8
        ? 2
        : values.averageRating >= 4.4
          ? 1
          : 0;

  const cap =
    values.reviewStrength === "strong"
      ? 20
      : values.reviewStrength === "some"
        ? 16
        : values.reviewStrength === "few"
          ? values.reviewRequestCadence === "never"
            ? 8
            : 10
          : values.reviewRequestCadence === "regularly"
            ? 6
            : values.reviewRequestCadence === "sometimes"
              ? 5
              : 3;

  const score = clampScore(strengthBase + cadenceBonus + countBonus + ratingBonus, cap);
  const note =
    values.reviewStrength === "none" &&
    (values.reviewRequestCadence === "never" || values.reviewRequestCadence === "rarely")
      ? "There are little to no review signals yet, and there is not a dependable process to improve that."
      : values.reviewStrength === "none"
        ? "Reviews are still very light, but there is at least some intent to build a better trust base."
        : values.reviewStrength === "few"
          ? "A small review base exists, but it is not consistent enough yet to sell confidence quickly."
          : values.reviewStrength === "some"
            ? "Trust signals are present and useful, though there is still room to strengthen the review engine."
            : "Reviews and trust signals are doing meaningful work already.";

  return {
    key: "REVIEWS_TRUST" as const,
    label: "Reviews & Trust",
    score,
    note,
  };
}

function buildSocialCategory(values: PresenceCheckInput) {
  const base =
    values.socialPresenceLevel === "multiple-active"
      ? 15
      : values.socialPresenceLevel === "one-active"
        ? 10
        : values.socialPresenceLevel === "one-occasional"
          ? 6
          : 2;
  const platformBonus =
    values.socialPresenceLevel === "multiple-active" && values.socialPlatforms.length >= 2
      ? 2
      : values.socialPresenceLevel !== "none" && values.socialPlatforms.length >= 1
        ? 1
        : 0;
  const advertisingBonus =
    values.runsAdvertising === "yes"
      ? 2
      : values.runsAdvertising === "occasionally"
        ? 1
        : 0;
  const cap =
    values.socialPresenceLevel === "multiple-active"
      ? 20
      : values.socialPresenceLevel === "one-active"
        ? 14
        : values.socialPresenceLevel === "one-occasional"
          ? 9
          : 4;

  const score = clampScore(base + platformBonus + advertisingBonus, cap);
  const note =
    values.socialPresenceLevel === "none"
      ? "There is little visible brand activity beyond core business listings right now."
      : values.socialPresenceLevel === "one-occasional"
        ? "A social channel exists, but the activity level is still too light to reinforce trust consistently."
        : values.socialPresenceLevel === "one-active"
          ? "One social channel is doing a useful job, though the brand footprint is still fairly narrow."
          : "Brand activity is active across more than one channel, which helps reinforce recency and professionalism.";

  return {
    key: "SOCIAL_BRAND_ACTIVITY" as const,
    label: "Social Presence / Brand Activity",
    score,
    note,
  };
}

function buildActionCategory(values: PresenceCheckInput) {
  const hasLiveWebsite = ["basic", "mostly-complete", "polished"].includes(
    values.websiteStatus,
  );
  const hasLiveGoogleProfile = ["claimed-incomplete", "claimed-mostly-complete", "active"].includes(
    values.googleBusinessProfileStatus,
  );
  const goalIntentBonus = values.goals.some((goal) =>
    ["Calls", "Leads", "Bookings"].includes(goal),
  )
    ? 2
    : 1;
  const channelBonus =
    values.discoveryChannels.length >= 4
      ? 4
      : values.discoveryChannels.length >= 3
        ? 3
        : values.discoveryChannels.length >= 2
          ? 2
          : 1;
  const websiteBonus =
    values.websiteStatus === "polished"
      ? 7
      : values.websiteStatus === "mostly-complete"
        ? 5
        : values.websiteStatus === "basic"
          ? 3
          : values.websiteStatus === "in-progress"
            ? 1
            : 0;
  const contactBonus = values.phone?.trim() ? 3 : 0;
  const localBonus = hasLiveGoogleProfile ? 2 : 0;

  let cap = 20;

  if (!hasLiveWebsite && !values.phone?.trim() && !hasLiveGoogleProfile) {
    cap = 5;
  } else if (!hasLiveWebsite && !hasLiveGoogleProfile) {
    cap = 7;
  } else if (!hasLiveWebsite) {
    cap = 10;
  }

  const score = clampScore(3 + goalIntentBonus + channelBonus + websiteBonus + contactBonus + localBonus, cap);
  const note =
    score <= 7
      ? "Customers do not yet have a strong, consistent path from discovery to action."
      : score <= 12
        ? "There is some action readiness, but the path to calling, booking, or trusting still looks uneven."
        : score <= 16
          ? "Customers have a workable next-step path, though it could be clearer and easier."
          : "Customers can move from discovery to action fairly clearly, which is a real asset.";

  return {
    key: "CUSTOMER_ACTION_READINESS" as const,
    label: "Customer Action Readiness",
    score,
    note,
  };
}

function buildTier(score: number): QuickScoreTier {
  if (score >= 85) {
    return "Strong online presence";
  }

  if (score >= 65) {
    return "Solid foundation with improvement opportunities";
  }

  if (score >= 45) {
    return "Basic foundation with clear gaps";
  }

  if (score >= 25) {
    return "Early-stage presence";
  }

  return "Limited online foundation";
}

function buildSummary(tier: QuickScoreTier, coreGapCount: number) {
  if (tier === "Strong online presence") {
    return "Your business already shows a strong online foundation. The most practical opportunity is refining what exists instead of rebuilding from scratch.";
  }

  if (tier === "Solid foundation with improvement opportunities") {
    return "There is a credible base in place, but a few visible gaps are likely costing trust, consistency, or conversion opportunity.";
  }

  if (tier === "Basic foundation with clear gaps") {
    return coreGapCount >= 2
      ? "Some important pieces are in place, but too many core signals are still inconsistent for the presence to feel dependable."
      : "The business has a workable starting point online, but a few important weak spots still hold it back.";
  }

  if (tier === "Early-stage presence") {
    return "The online presence is still in an early stage. Customers can find some signals, but the foundation is too thin to build strong confidence yet.";
  }

  return "Too many core foundations are still missing or incomplete for the current online presence to feel strong or trustworthy.";
}

function buildEncouragement(tier: QuickScoreTier) {
  if (tier === "Strong online presence") {
    return "This looks more like optimization work than rescue work.";
  }

  if (tier === "Solid foundation with improvement opportunities") {
    return "Targeted improvements here should compound well because the foundation is already real.";
  }

  if (tier === "Basic foundation with clear gaps") {
    return "This is the kind of score where a few grounded fixes can noticeably improve trust and response quality.";
  }

  if (tier === "Early-stage presence") {
    return "The good news is that the biggest opportunities are usually straightforward foundational fixes, not complicated marketing tricks.";
  }

  return "The honest read is that the foundation needs work, but those gaps are still fixable with practical next steps.";
}

function buildStrengths(
  values: PresenceCheckInput,
  categories: QuickScoreResult["categories"],
) {
  const strengths: string[] = [];

  if (values.websiteStatus === "polished" || values.websiteStatus === "mostly-complete") {
    strengths.push("A live website is already giving customers a credible place to evaluate the business.");
  }

  if (
    values.googleBusinessProfileStatus === "active" ||
    values.googleBusinessProfileStatus === "claimed-mostly-complete"
  ) {
    strengths.push("Google / local presence is already established enough to support nearby discovery.");
  }

  if (
    ["some", "strong"].includes(values.reviewStrength) &&
    ["sometimes", "regularly"].includes(values.reviewRequestCadence)
  ) {
    strengths.push("Reviews are doing real trust work, and there is a repeatable process behind them.");
  }

  if (values.socialPresenceLevel === "multiple-active") {
    strengths.push("Brand activity looks current across more than one social channel.");
  } else if (values.socialPresenceLevel === "one-active") {
    strengths.push("At least one social channel is active enough to reinforce that the business is current.");
  }

  if (categories.find((category) => category.key === "CUSTOMER_ACTION_READINESS")?.score ?? 0 >= 16) {
    strengths.push("Customers have a reasonably clear path to call, book, or take the next step.");
  }

  return strengths.slice(0, 3);
}

function buildImprovements(
  values: PresenceCheckInput,
  categories: QuickScoreResult["categories"],
) {
  const improvements: string[] = [];

  if (values.websiteStatus === "none") {
    improvements.push("A live website is still missing, which leaves a major trust and conversion gap.");
  } else if (values.websiteStatus === "in-progress") {
    improvements.push("The website is not live yet, so customers still do not have a dependable home base online.");
  } else if (values.websiteStatus === "basic") {
    improvements.push("The website needs more clarity and polish before it can carry trust confidently.");
  }

  if (
    values.googleBusinessProfileStatus === "none" ||
    values.googleBusinessProfileStatus === "not-sure"
  ) {
    improvements.push("Google Business Profile visibility is missing or uncertain, which weakens local discovery.");
  } else if (values.googleBusinessProfileStatus === "claimed-incomplete") {
    improvements.push("The Google Business Profile exists, but it still looks incomplete enough to underperform.");
  }

  if (
    values.reviewStrength === "none" &&
    ["never", "rarely"].includes(values.reviewRequestCadence)
  ) {
    improvements.push("There is almost no review foundation yet, and the business is not asking often enough to change that.");
  } else if (values.reviewStrength === "few") {
    improvements.push("The review base is still too thin to build strong confidence on its own.");
  }

  if (values.socialPresenceLevel === "none") {
    improvements.push("Visible brand activity is almost nonexistent beyond basic listings.");
  } else if (values.socialPresenceLevel === "one-occasional") {
    improvements.push("Social activity is too occasional right now to reinforce recency and professionalism.");
  }

  if (
    (categories.find((category) => category.key === "CUSTOMER_ACTION_READINESS")?.score ?? 0) <= 10
  ) {
    improvements.push("Customers do not yet have a strong enough path from discovery to trust to action.");
  }

  return improvements.slice(0, 3);
}

function buildSuggestedPlanSlugs(
  categories: QuickScoreResult["categories"],
  coreGapCount: number,
) {
  const websiteScore =
    categories.find((category) => category.key === "WEBSITE_PRESENCE")?.score ?? 0;
  const localScore =
    categories.find((category) => category.key === "GOOGLE_LOCAL_PRESENCE")?.score ?? 0;
  const overallScore = categories.reduce((total, category) => total + category.score, 0);

  return [
    ...(localScore <= 10 ? ["gbp-boost"] : []),
    ...(websiteScore <= 10 ? ["quick-website-launch"] : []),
    ...(overallScore <= 64 || coreGapCount >= 2
      ? ["manual-comprehensive-audit"]
      : ["visibility-care-plan"]),
  ].filter((value, index, list) => list.indexOf(value) === index);
}

export function buildQuickScore(values: PresenceCheckInput): QuickScoreResult {
  const categories = [
    buildWebsiteCategory(values),
    buildLocalCategory(values),
    buildReviewsCategory(values),
    buildSocialCategory(values),
    buildActionCategory(values),
  ];

  const coreGapCount = countCoreGaps(values);
  const uncappedScore = categories.reduce((total, category) => total + category.score, 0);
  const scoreCap =
    coreGapCount >= 3 ? 38 : coreGapCount === 2 ? 52 : coreGapCount === 1 ? 68 : 100;
  const score = Math.min(uncappedScore, scoreCap);
  const tier = buildTier(score);

  return {
    score,
    tier,
    summary: buildSummary(tier, coreGapCount),
    encouragement: buildEncouragement(tier),
    strengths: buildStrengths(values, categories),
    improvements: buildImprovements(values, categories),
    suggestedPlanSlugs: buildSuggestedPlanSlugs(categories, coreGapCount),
    categories,
  };
}
