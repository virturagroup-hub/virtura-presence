import type { PresenceCheckInput } from "@/lib/validations/presence-check";

export type QuickScoreResult = {
  score: number;
  tier: "Strong footing" | "Promising with clear upside" | "Needs focused attention";
  summary: string;
  encouragement: string;
  strengths: string[];
  improvements: string[];
  suggestedPlanSlugs: string[];
  categories: Array<{
    key:
      | "WEBSITE_PRESENCE"
      | "GOOGLE_LOCAL_PRESENCE"
      | "REVIEWS_TRUST"
      | "SOCIAL_BRAND_ACTIVITY"
      | "CUSTOMER_ACTION_READINESS";
    label: string;
    score: number;
    note: string;
  }>;
};

function clampScore(score: number) {
  return Math.max(0, Math.min(20, Math.round(score)));
}

export function buildQuickScore(values: PresenceCheckInput): QuickScoreResult {
  const websiteScore = clampScore(
    values.hasWebsite === "yes"
      ? 10 + (values.websiteUrl ? 6 : 0) + (values.phone ? 2 : 0)
      : values.hasWebsite === "in-progress"
        ? 8
        : 3,
  );

  const localScore = clampScore(
    values.usesGoogleBusinessProfile === "yes"
      ? 11 + (values.googleBusinessProfileUrl ? 5 : 0)
      : values.usesGoogleBusinessProfile === "not-sure"
        ? 8
        : 4,
  );

  const reviewScore = clampScore(
    values.collectsReviews === "yes"
      ? 17
      : values.collectsReviews === "somewhat"
        ? 12
        : 5,
  );

  const socialScore = clampScore(
    Math.min(18, values.socialPlatforms.length * 4) +
      (values.runsAdvertising === "yes" ? 2 : values.runsAdvertising === "occasionally" ? 1 : 0),
  );

  const actionScore = clampScore(
    8 +
      Math.min(6, values.discoveryChannels.length * 2) +
      Math.min(4, values.goals.length),
  );

  const categories = [
    {
      key: "WEBSITE_PRESENCE" as const,
      label: "Website Presence",
      score: websiteScore,
      note:
        websiteScore >= 15
          ? "There is enough website structure to support trust, but clarity and proof can likely be sharpened further."
          : "The website foundation needs more work to carry trust and conversion weight confidently.",
    },
    {
      key: "GOOGLE_LOCAL_PRESENCE" as const,
      label: "Google / Local Presence",
      score: localScore,
      note:
        localScore >= 15
          ? "Local visibility has a useful base already, which gives the business something practical to build on."
          : "Local presence looks lighter than it should be, so nearby discovery is probably inconsistent.",
    },
    {
      key: "REVIEWS_TRUST" as const,
      label: "Reviews & Trust",
      score: reviewScore,
      note:
        reviewScore >= 15
          ? "Trust signals are doing real work already, which is a strong asset for a service business."
          : "Trust signals exist, but the review picture is not strong enough yet to sell confidence on its own.",
    },
    {
      key: "SOCIAL_BRAND_ACTIVITY" as const,
      label: "Social Presence / Brand Activity",
      score: socialScore,
      note:
        socialScore >= 14
          ? "Brand activity is visible enough to reinforce professionalism and recency."
          : "Brand activity feels lighter than the business quality likely deserves, so visibility is less reinforced.",
    },
    {
      key: "CUSTOMER_ACTION_READINESS" as const,
      label: "Customer Action Readiness",
      score: actionScore,
      note:
        actionScore >= 16
          ? "Customers have a reasonably clear path to the next step, which is a meaningful strength."
          : "Customers may still need a more direct path from trust to action.",
    },
  ];

  const score = categories.reduce((total, category) => total + category.score, 0);
  const tier =
    score >= 80
      ? "Strong footing"
      : score >= 60
        ? "Promising with clear upside"
        : "Needs focused attention";

  const strongestCategories = [...categories]
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .filter((category) => category.score >= 12);

  const weakestCategories = [...categories]
    .sort((left, right) => left.score - right.score)
    .slice(0, 3)
    .filter((category) => category.score < 15);

  const strengths = strongestCategories.map((category) => category.note);
  const improvements = weakestCategories.map((category) => category.note);

  const suggestedPlanSlugs = [
    ...(localScore < 14 ? ["gbp-boost"] : []),
    ...(websiteScore < 14 ? ["quick-website-launch"] : []),
    ...(score >= 68 ? ["visibility-care-plan"] : ["manual-comprehensive-audit"]),
  ].filter((value, index, valuesList) => valuesList.indexOf(value) === index);

  const summary =
    tier === "Strong footing"
      ? "Your business already shows a solid online foundation. The biggest opportunity is refining what exists so trust and action happen more smoothly."
      : tier === "Promising with clear upside"
        ? "You already have meaningful pieces in place, but a few visible gaps are likely keeping your presence from pulling its full weight."
        : "There are workable building blocks here, but a few core visibility and trust signals need attention before the presence can feel consistently strong.";

  const encouragement =
    tier === "Strong footing"
      ? "This is not a rescue situation. It is an optimization opportunity."
      : tier === "Promising with clear upside"
        ? "This is the kind of score where practical, targeted improvements can make a noticeable difference."
        : "The good news is that the gaps look fixable with focused, grounded next steps rather than hype or guesswork.";

  return {
    score,
    tier,
    summary,
    encouragement,
    strengths,
    improvements,
    suggestedPlanSlugs,
    categories,
  };
}
