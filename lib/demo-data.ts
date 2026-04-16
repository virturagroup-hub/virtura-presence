import { servicePlans } from "@/lib/plan-catalog";

export const demoAssessment = {
  score: 68,
  tier: "Solid foundation with improvement opportunities",
  summary:
    "Harbor & Pine HVAC looks credible online, but trust and consistency signals still leave room for improvement.",
  encouragement:
    "There is already enough traction here to build on. The next wins are about tightening consistency, not rebuilding everything.",
  strengths: [
    "A live website gives customers a credible place to evaluate the business.",
    "Google / local presence is established enough to support nearby discovery.",
    "Customers have a reasonably clear path to call or take the next step.",
  ],
  improvements: [
    "Review cadence and proof visibility still need to become more consistent.",
    "Social activity exists but does not yet reinforce trust strongly enough.",
    "Service clarity and proof near the top of the site still have room to improve.",
  ],
  categories: [
    {
      key: "WEBSITE_PRESENCE",
      label: "Website Presence",
      score: 15,
      note: "The site has a credible base, but clarity, proof, and polish still have room to improve.",
    },
    {
      key: "GOOGLE_LOCAL_PRESENCE",
      label: "Google / Local Presence",
      score: 15,
      note: "Local presence has a usable foundation, but it still needs steadier upkeep and completeness.",
    },
    {
      key: "REVIEWS_TRUST",
      label: "Reviews & Trust",
      score: 13,
      note: "Trust signals are present and useful, though there is still room to strengthen the review engine.",
    },
    {
      key: "SOCIAL_BRAND_ACTIVITY",
      label: "Social Presence / Brand Activity",
      score: 11,
      note: "One social channel is doing a useful job, though the brand footprint is still fairly narrow.",
    },
    {
      key: "CUSTOMER_ACTION_READINESS",
      label: "Customer Action Readiness",
      score: 14,
      note: "Customers have a workable next-step path, though it could be clearer and easier.",
    },
  ],
};

export const demoPortal = {
  businessName: "Harbor & Pine HVAC",
  primaryContact: "Avery Collins",
  location: "Tulsa, OK",
  auditStatus: "Published",
  auditUpdatedLabel: "Updated April 14, 2026",
  nextSteps: [
    "Review the published manual audit and confirm which changes feel most urgent.",
    "Decide whether local profile cleanup or website clarity should come first.",
    "Request a consultant follow-up if you want help sequencing the work.",
  ],
  recommendedPlanSlugs: ["visibility-care-plan", "gbp-boost"],
  highlights: [
    "Local discovery is working better than average for a first-pass review.",
    "Trust signals are present, but review cadence is not doing enough work yet.",
    "The business has enough foundation to benefit from practical, targeted improvements.",
  ],
};

export const demoWorkspace = {
  summaryCards: [
    { label: "New submissions", value: "12", change: "+4 this week" },
    { label: "In review", value: "5", change: "2 need assignment" },
    { label: "Published audits", value: "18", change: "3 today" },
    { label: "Follow-up due", value: "7", change: "Honest nurture queue" },
  ],
  leadQueue: [
    {
      id: "harbor-pine-hvac",
      businessName: "Harbor & Pine HVAC",
      location: "Tulsa, OK",
      status: "in review",
      score: 74,
      owner: "Avery Collins",
    },
    {
      id: "lighthouse-dental",
      businessName: "Lighthouse Dental",
      location: "Wichita, KS",
      status: "pending review",
      score: 67,
      owner: "Morgan Silva",
    },
    {
      id: "fieldstone-electric",
      businessName: "Fieldstone Electric",
      location: "Des Moines, IA",
      status: "new",
      score: 58,
      owner: "Jordan Reese",
    },
  ],
  followUps: [
    {
      businessName: "Harbor & Pine HVAC",
      channel: "Email",
      state: "scheduled",
      note: "Send published audit follow-up with plan options tomorrow morning.",
    },
    {
      businessName: "Lighthouse Dental",
      channel: "Call",
      state: "replied",
      note: "Owner wants help prioritizing review improvements before website work.",
    },
  ],
};

export const demoSubmissionDetail = {
  id: "harbor-pine-hvac",
  businessName: "Harbor & Pine HVAC",
  ownerName: "Avery Collins",
  email: "client@virturapresence.com",
  phone: "(918) 555-0142",
  businessCategory: "Residential HVAC",
  city: "Tulsa",
  state: "OK",
  serviceArea: "Tulsa metro and surrounding suburbs",
  hasWebsite: "yes",
  websiteUrl: "https://www.harborpinehvac.com",
  usesGoogleBusinessProfile: "yes",
  googleBusinessProfileUrl: "https://g.page/r/example",
  socialPlatforms: ["Facebook", "Instagram"],
  runsAdvertising: "occasionally",
  discoveryChannels: ["Google search", "Google Business Profile", "Referrals"],
  collectsReviews: "somewhat",
  goals: ["Calls", "Trust", "Visibility"],
  notes:
    "We get good referral business, but newer customers say they found us online and I am not sure if the site is helping enough.",
};

export const demoAuditSections = [
  {
    category: "Website Presence",
    score: 15,
    headline: "Solid base with room for sharper conversion messaging",
    clientNotes:
      "The website gives the business legitimacy, but the service offering and proof of trust could be clearer faster.",
    internalNotes:
      "Recommend stronger above-the-fold service framing, review pull-through, and more obvious emergency-contact path.",
  },
  {
    category: "Google / Local Presence",
    score: 16,
    headline: "Good local footing that can be tightened for consistency",
    clientNotes:
      "The business is visible locally, but profile completeness and freshness can still improve trust.",
    internalNotes:
      "Photos, service detail, Q&A, and a steadier review-response cadence would likely lift confidence quickly.",
  },
  {
    category: "Reviews & Trust",
    score: 13,
    headline: "Trust exists, but it is not being reinforced enough yet",
    clientNotes:
      "Reviews are present, which helps, but the cadence and visibility of proof could be stronger.",
    internalNotes:
      "Build a low-friction post-job review request process and pull stronger social proof onto the site.",
  },
  {
    category: "Social Presence / Brand Activity",
    score: 12,
    headline: "Visible but lighter than the business quality deserves",
    clientNotes:
      "Social channels are active enough to show the brand exists, but they do not yet deepen trust consistently.",
    internalNotes:
      "Low-effort brand activity plan should focus on recent jobs, team presence, and community proof rather than volume.",
  },
  {
    category: "Customer Action Readiness",
    score: 18,
    headline: "Customers can clearly take the next step",
    clientNotes:
      "Contact paths are clear, which is one of the strongest parts of the current presence.",
    internalNotes:
      "Protect this strength while improving trust and message clarity elsewhere.",
  },
];

export const demoRecommendedPlans = servicePlans.filter((plan) =>
  demoPortal.recommendedPlanSlugs.includes(plan.slug),
);
