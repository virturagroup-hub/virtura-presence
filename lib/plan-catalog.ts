export type ServicePlanDefinition = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  idealFor: string;
  tierLabel: string;
  accentColor: string;
  featured?: boolean;
  deliverables: string[];
  outcomes: string[];
};

export const servicePlans: ServicePlanDefinition[] = [
  {
    slug: "gbp-boost",
    name: "Google Business Profile Boost",
    tagline: "Sharpen local trust and discovery where nearby customers search first.",
    summary:
      "A focused cleanup and positioning package for businesses that need a stronger Google and local-presence foundation.",
    idealFor: "Service providers with inconsistent local visibility or incomplete profile coverage.",
    tierLabel: "Local visibility",
    accentColor: "from-brand-500/20 via-brand-500/8 to-cyan-300/20",
    deliverables: [
      "Profile review and completeness recommendations",
      "Category, services, and trust-signal optimization guidance",
      "Review-response and photo refresh checklist",
    ],
    outcomes: ["Better map-pack readiness", "Clearer trust signals", "Stronger local consistency"],
  },
  {
    slug: "quick-website-launch",
    name: "Quick Website Launch",
    tagline: "Create a clean, credible site foundation when the business needs clarity fast.",
    summary:
      "A streamlined website plan built for businesses that need a better front door before they spend more effort on visibility.",
    idealFor: "Businesses with no site, an outdated site, or unclear contact and service messaging.",
    tierLabel: "Website readiness",
    accentColor: "from-slate-900/85 via-slate-800/70 to-brand-700/70",
    deliverables: [
      "Messaging and service-clarity framework",
      "Contact-path and conversion structure",
      "Launch-ready page recommendations",
    ],
    outcomes: ["Stronger first impression", "Fewer drop-offs", "Cleaner call or lead paths"],
  },
  {
    slug: "visibility-care-plan",
    name: "Visibility Care Plan",
    tagline: "Maintain momentum with grounded, recurring visibility support.",
    summary:
      "An ongoing support plan for businesses that already have core channels in place but need steadier upkeep and refinement.",
    idealFor: "Owners who need consistency across reviews, local presence, and light brand activity.",
    tierLabel: "Ongoing support",
    accentColor: "from-sky-400/20 via-brand-500/10 to-white/20",
    featured: true,
    deliverables: [
      "Monthly presence review and action list",
      "Review and profile consistency check-ins",
      "Channel-priority recommendations and follow-up notes",
    ],
    outcomes: ["Steadier visibility", "Clearer maintenance rhythm", "Lower effort for owners"],
  },
  {
    slug: "manual-comprehensive-audit",
    name: "Manual Comprehensive Audit",
    tagline: "Get a deeper, consultant-reviewed read on what is helping and what is holding you back.",
    summary:
      "A full manual review of key online presence signals for businesses that want sharper guidance before investing in changes.",
    idealFor: "Owners who want a thorough consultant perspective without a bloated SEO crawl.",
    tierLabel: "Deep review",
    accentColor: "from-indigo-500/20 via-brand-600/12 to-slate-900/20",
    deliverables: [
      "Manual website, local, review, and action-readiness audit",
      "Consultant summary with practical recommendations",
      "Prioritized service-plan guidance where it genuinely fits",
    ],
    outcomes: ["Clear diagnosis", "Honest priorities", "Better decision confidence"],
  },
];
