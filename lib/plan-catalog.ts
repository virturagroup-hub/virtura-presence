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
  quickPrice: string;
  quickPriceNote: string;
  pricingDetails: string[];
  scopeNotes: string[];
};

export const servicePlans: ServicePlanDefinition[] = [
  {
    slug: "gbp-boost",
    name: "Google Business Profile Boost",
    tagline: "Build or rebuild a stronger local front door where nearby customers decide who to trust.",
    summary:
      "A focused local package for businesses that need a cleaner, more credible Google Business Profile without turning it into a bloated SEO project.",
    idealFor:
      "Small businesses and service providers with no profile yet, an incomplete profile, or a profile that no longer reflects the business clearly.",
    tierLabel: "Local visibility",
    accentColor: "from-brand-500/20 via-brand-500/8 to-cyan-300/20",
    quickPrice: "$249",
    quickPriceNote: "One-time setup and optimization package",
    pricingDetails: [
      "$249 one-time setup and optimization package",
      "Includes 3 months of Visibility Care",
      "Continued Visibility Care is optional at $99/month after the included period",
      "Multi-location or expanded scope can be quoted separately if needed",
    ],
    deliverables: [
      "Google Business Profile build or rebuild",
      "Profile cleanup and optimization",
      "Category and service refinement",
      "Local trust and visibility improvements",
      "Three months of Visibility Care included",
    ],
    outcomes: [
      "A clearer profile foundation for local discovery",
      "Stronger first-glance trust for nearby customers",
      "More consistent local visibility signals",
    ],
    scopeNotes: [
      "Best for businesses that need a practical Google profile foundation before investing in broader visibility work.",
      "Expanded scope, extra locations, or deeper cleanup can be quoted separately when needed.",
    ],
  },
  {
    slug: "quick-website-launch",
    name: "Quick Website Launch",
    tagline: "Launch a simple, credible site when the business needs clarity more than complexity.",
    summary:
      "A focused launch offer for businesses that need a clean, clear web presence customers can trust and contact without delay.",
    idealFor:
      "Businesses with no live site, an outdated site, or a site that still feels too thin to support trust and contact readiness.",
    tierLabel: "Website readiness",
    accentColor: "from-slate-900/85 via-slate-800/70 to-brand-700/70",
    quickPrice: "Starting at $349",
    quickPriceNote: "Focused launch pricing by page count",
    pricingDetails: [
      "1-page launch: $349",
      "2-page launch: $499",
      "3-page launch: $599",
      "Additional pages: starting at $125 each",
    ],
    deliverables: [
      "Focused launch scope built for clarity, trust, and contact readiness",
      "Clear service and contact-path structure",
      "Clean, mobile-friendly presentation",
      "A practical web foundation that is easy to expand later if needed",
    ],
    outcomes: [
      "A stronger first impression",
      "Cleaner contact and lead paths",
      "A more credible online front door for small businesses",
    ],
    scopeNotes: [
      "This is intentionally a simple launch offer, not a custom-feature web build.",
      "Additional custom functionality or expanded content scope may require a custom quote.",
    ],
  },
  {
    slug: "visibility-care-plan",
    name: "Visibility Care Plan",
    tagline: "Maintain momentum with grounded, recurring visibility support.",
    summary:
      "An ongoing support plan for businesses that already have the core pieces in place and need steady upkeep instead of stop-and-start fixes.",
    idealFor:
      "Businesses that want calm, consistent support across profile updates, review signals, and light visibility upkeep without overcommitting to a large retainer.",
    tierLabel: "Ongoing support",
    accentColor: "from-sky-400/20 via-brand-500/10 to-white/20",
    featured: true,
    quickPrice: "$99/mo",
    quickPriceNote: "Ongoing month-to-month support",
    pricingDetails: [
      "$99/month for ongoing month-to-month support",
      "Best after Google Business Profile Boost or for businesses that need steady upkeep",
      "Built to support consistency across profile, review, and light visibility refinement",
    ],
    deliverables: [
      "Profile updates and visibility refinement",
      "Review and profile consistency support",
      "Light website update support where it fits the agreed scope",
      "Practical next-step guidance instead of bloated retainers or vague maintenance promises",
    ],
    outcomes: [
      "Steadier visibility upkeep",
      "More consistent trust signals over time",
      "Lower maintenance pressure on the owner",
    ],
    scopeNotes: [
      "Ad spend management, major rebuild work, and large custom projects are not included unless separately scoped.",
      "This plan is best for steady upkeep, not one-time rescue work.",
    ],
  },
  {
    slug: "manual-comprehensive-audit",
    name: "Manual Comprehensive Audit",
    tagline: "Get a deeper consultant-reviewed read on what is helping, what is missing, and what to do next.",
    summary:
      "A consultant-reviewed manual audit for businesses that want a practical action plan instead of an automated SEO crawl dressed up as strategy.",
    idealFor:
      "Owners who want clearer priorities before spending money, and who value grounded recommendations over hype or automated grading theatre.",
    tierLabel: "Deep review",
    accentColor: "from-indigo-500/20 via-brand-600/12 to-slate-900/20",
    quickPrice: "$79",
    quickPriceNote: "Consultant-reviewed manual audit",
    pricingDetails: [
      "$79 consultant-reviewed audit",
      "Includes a practical action plan and prioritized recommendations",
      "You can implement the recommendations yourself or hire Virtura to help",
      "Expanded or custom-scope audits can be quoted separately if needed",
    ],
    deliverables: [
      "Manual review of website, local presence, review signals, and action readiness",
      "Consultant summary with practical recommendations",
      "Prioritized action plan with clear next-step options",
      "Service recommendations only where they genuinely fit",
    ],
    outcomes: ["Clearer diagnosis", "Honest priorities", "Better decision confidence"],
    scopeNotes: [
      "This is not an automated crawler product and it does not try to impersonate one.",
      "Custom or expanded audit scope can be quoted separately when the business needs something broader.",
    ],
  },
];

export const servicePlanCatalogBySlug = Object.fromEntries(
  servicePlans.map((plan) => [plan.slug, plan]),
) as Record<string, ServicePlanDefinition>;

export function buildServicePlanInquiryHref(planName: string) {
  const subject = encodeURIComponent(`Virtura Presence service question: ${planName}`);
  return `mailto:hello@virtura.us?subject=${subject}`;
}

export function resolveServicePlanDefinition(
  plan: Pick<ServicePlanDefinition, "slug"> &
    Partial<Omit<ServicePlanDefinition, "slug">>,
) {
  const catalogPlan = servicePlanCatalogBySlug[plan.slug];

  if (catalogPlan) {
    return {
      ...catalogPlan,
      featured: plan.featured ?? catalogPlan.featured,
      accentColor: plan.accentColor ?? catalogPlan.accentColor,
    } as ServicePlanDefinition;
  }

  return {
    ...({
      name: plan.slug,
      tagline: "",
      summary: "",
      idealFor: "",
      tierLabel: "Service plan",
      accentColor: "from-brand-500/20 to-cyan-300/20",
      deliverables: [],
      outcomes: [],
      quickPrice: "Custom quote",
      quickPriceNote: "Scope reviewed before pricing",
      pricingDetails: ["Pricing is quoted after a quick review of the actual scope."],
      scopeNotes: ["This service is not part of the current public pricing catalog."],
    } satisfies Omit<ServicePlanDefinition, "slug" | "featured">),
    ...plan,
  } as ServicePlanDefinition;
}
