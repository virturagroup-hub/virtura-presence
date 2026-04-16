import "@/scripts/load-env";
import { hash } from "bcryptjs";
import {
  AdvertisingCadence,
  AuditCategory,
  AuditStatus,
  GoogleBusinessProfileStatus,
  PrismaClient,
  RecommendationStatus,
  ReviewRequestCadence,
  ReviewStrength,
  ScoreTier,
  SocialPresenceLevel,
  SubmissionStatus,
  WebsiteStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

function getRequiredSeedEnv(key: string) {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(
      `Seed configuration is missing ${key}. Add it to your environment before running npm run db:seed so the real admin account can be created safely.`,
    );
  }

  return value;
}

async function main() {
  const shouldSeedDemoData = process.env.SEED_DEMO_DATA === "true";

  const plans = [
    {
      slug: "gbp-boost",
      name: "Google Business Profile Boost",
      tagline:
        "Build or rebuild a stronger local front door where nearby customers decide who to trust.",
      summary:
        "A focused local package for businesses that need a cleaner, more credible Google Business Profile without turning it into a bloated SEO project.",
      idealFor:
        "Small businesses and service providers with no profile yet, an incomplete profile, or a profile that no longer reflects the business clearly.",
      tierLabel: "Local visibility",
      accentColor: "from-brand-500/20 via-brand-500/8 to-cyan-300/20",
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
      featured: false,
    },
    {
      slug: "quick-website-launch",
      name: "Quick Website Launch",
      tagline:
        "Launch a simple, credible site when the business needs clarity more than complexity.",
      summary:
        "A focused launch offer for businesses that need a clean, clear web presence customers can trust and contact without delay.",
      idealFor:
        "Businesses with no live site, an outdated site, or a site that still feels too thin to support trust and contact readiness.",
      tierLabel: "Website readiness",
      accentColor: "from-slate-900/85 via-slate-800/70 to-brand-700/70",
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
      featured: false,
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
      featured: true,
    },
    {
      slug: "manual-comprehensive-audit",
      name: "Manual Comprehensive Audit",
      tagline:
        "Get a deeper consultant-reviewed read on what is helping, what is missing, and what to do next.",
      summary:
        "A consultant-reviewed manual audit for businesses that want a practical action plan instead of an automated SEO crawl dressed up as strategy.",
      idealFor:
        "Owners who want clearer priorities before spending money, and who value grounded recommendations over hype or automated grading theatre.",
      tierLabel: "Deep review",
      accentColor: "from-indigo-500/20 via-brand-600/12 to-slate-900/20",
      deliverables: [
        "Manual review of website, local presence, review signals, and action readiness",
        "Consultant summary with practical recommendations",
        "Prioritized action plan with clear next-step options",
        "Service recommendations only where they genuinely fit",
      ],
      outcomes: ["Clearer diagnosis", "Honest priorities", "Better decision confidence"],
      featured: false,
    },
  ];

  for (const plan of plans) {
    await prisma.servicePlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim() || "admin@virturagroup.com";
  const adminName = process.env.ADMIN_NAME?.trim() || "Virtura Admin";
  const adminPasswordHash = await hash(getRequiredSeedEnv("ADMIN_PASSWORD"), 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: "ADMIN",
      passwordHash: adminPasswordHash,
      emailVerified: new Date(),
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: "ADMIN",
      passwordHash: adminPasswordHash,
      emailVerified: new Date(),
    },
  });

  if (!shouldSeedDemoData) {
    console.log("Virtura Presence base seed complete", {
      servicePlans: plans.length,
      admin: admin.email,
      demoData: false,
      note: "Admin is always seeded from ADMIN_EMAIL / ADMIN_PASSWORD. Demo client and consultant data stay optional under SEED_DEMO_DATA=true.",
    });
    return;
  }

  const consultantPassword = await hash(
    process.env.DEMO_CONSULTANT_PASSWORD ?? "VirturaConsultant!2026",
    10,
  );
  const clientPassword = await hash(
    process.env.DEMO_CLIENT_PASSWORD ?? "VirturaClient!2026",
    10,
  );

  const [consultant, client] = await Promise.all([
    prisma.user.upsert({
      where: {
        email: process.env.DEMO_CONSULTANT_EMAIL ?? "consultant@virturagroup.com",
      },
      update: {
        name: "Virtura Consultant",
        role: "CONSULTANT",
        passwordHash: consultantPassword,
        emailVerified: new Date(),
      },
      create: {
        email: process.env.DEMO_CONSULTANT_EMAIL ?? "consultant@virturagroup.com",
        name: "Virtura Consultant",
        role: "CONSULTANT",
        passwordHash: consultantPassword,
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: {
        email: process.env.DEMO_CLIENT_EMAIL ?? "client@virturapresence.com",
      },
      update: {
        name: "Avery Collins",
        role: "CLIENT",
        passwordHash: clientPassword,
        emailVerified: new Date(),
      },
      create: {
        email: process.env.DEMO_CLIENT_EMAIL ?? "client@virturapresence.com",
        name: "Avery Collins",
        role: "CLIENT",
        passwordHash: clientPassword,
        emailVerified: new Date(),
      },
    }),
  ]);

  const business = await prisma.business.upsert({
    where: { slug: "harbor-pine-hvac" },
    update: {
      name: "Harbor & Pine HVAC",
      ownerName: "Avery Collins",
      businessCategory: "Residential HVAC",
      city: "Tulsa",
      state: "OK",
      serviceArea: "Tulsa metro and surrounding suburbs",
      primaryEmail: client.email,
      primaryPhone: "(918) 555-0142",
      websiteUrl: "https://www.harborpinehvac.com",
      googleBusinessProfileUrl: "https://g.page/r/example",
      socialProfiles: ["Facebook", "Instagram"],
      socialLinks: {
        facebook: "https://facebook.com/harborpinehvac",
        instagram: "https://instagram.com/harborpinehvac",
      },
      discoveryChannels: ["Google search", "Google Business Profile", "Referrals"],
      goals: ["Calls", "Trust", "Visibility"],
      description:
        "Referral business is strong, but the owner wants the online presence to work harder with new customers.",
      websiteStatus: WebsiteStatus.MOSTLY_COMPLETE,
      googleBusinessProfileStatus: GoogleBusinessProfileStatus.CLAIMED_MOSTLY_COMPLETE,
      reviewStrength: ReviewStrength.SOME,
      reviewRequestCadence: ReviewRequestCadence.SOMETIMES,
      socialPresenceLevel: SocialPresenceLevel.ONE_ACTIVE,
      runsAdvertising: AdvertisingCadence.OCCASIONALLY,
      reviewCount: 24,
      averageRating: 4.6,
      notes:
        "Referral business is strong, but the owner wants the online presence to work harder with new customers.",
      status: SubmissionStatus.PUBLISHED,
      quickScore: 68,
      quickTier: ScoreTier.SOLID_FOUNDATION_IMPROVEMENTS,
      quickSummary:
        "A credible base exists, but trust and consistency signals still need tightening.",
      primaryContactId: client.id,
      assignedConsultantId: consultant.id,
      latestSubmittedAt: new Date("2026-04-14T16:00:00.000Z"),
      publishedAt: new Date("2026-04-14T18:00:00.000Z"),
    },
    create: {
      slug: "harbor-pine-hvac",
      name: "Harbor & Pine HVAC",
      ownerName: "Avery Collins",
      businessCategory: "Residential HVAC",
      city: "Tulsa",
      state: "OK",
      serviceArea: "Tulsa metro and surrounding suburbs",
      primaryEmail: client.email,
      primaryPhone: "(918) 555-0142",
      websiteUrl: "https://www.harborpinehvac.com",
      googleBusinessProfileUrl: "https://g.page/r/example",
      socialProfiles: ["Facebook", "Instagram"],
      socialLinks: {
        facebook: "https://facebook.com/harborpinehvac",
        instagram: "https://instagram.com/harborpinehvac",
      },
      discoveryChannels: ["Google search", "Google Business Profile", "Referrals"],
      goals: ["Calls", "Trust", "Visibility"],
      description:
        "Referral business is strong, but the owner wants the online presence to work harder with new customers.",
      websiteStatus: WebsiteStatus.MOSTLY_COMPLETE,
      googleBusinessProfileStatus: GoogleBusinessProfileStatus.CLAIMED_MOSTLY_COMPLETE,
      reviewStrength: ReviewStrength.SOME,
      reviewRequestCadence: ReviewRequestCadence.SOMETIMES,
      socialPresenceLevel: SocialPresenceLevel.ONE_ACTIVE,
      runsAdvertising: AdvertisingCadence.OCCASIONALLY,
      reviewCount: 24,
      averageRating: 4.6,
      notes:
        "Referral business is strong, but the owner wants the online presence to work harder with new customers.",
      status: SubmissionStatus.PUBLISHED,
      quickScore: 68,
      quickTier: ScoreTier.SOLID_FOUNDATION_IMPROVEMENTS,
      quickSummary:
        "A credible base exists, but trust and consistency signals still need tightening.",
      primaryContactId: client.id,
      assignedConsultantId: consultant.id,
      latestSubmittedAt: new Date("2026-04-14T16:00:00.000Z"),
      publishedAt: new Date("2026-04-14T18:00:00.000Z"),
    },
  });

  await prisma.notificationEvent.deleteMany({
    where: {
      OR: [{ businessId: business.id }, { userId: client.id }],
    },
  });
  await prisma.userActionToken.deleteMany({
    where: {
      OR: [{ email: client.email }, { userId: client.id }],
    },
  });
  await prisma.planRecommendation.deleteMany({ where: { businessId: business.id } });
  await prisma.internalNote.deleteMany({ where: { businessId: business.id } });
  await prisma.followUp.deleteMany({ where: { businessId: business.id } });
  await prisma.comprehensiveReportRequest.deleteMany({ where: { businessId: business.id } });
  await prisma.manualAudit.deleteMany({ where: { businessId: business.id } });
  await prisma.presenceCheck.deleteMany({ where: { businessId: business.id } });

  const presenceCheck = await prisma.presenceCheck.create({
    data: {
      businessId: business.id,
      submittedById: client.id,
      assignedConsultantId: consultant.id,
      status: SubmissionStatus.PUBLISHED,
      businessName: "Harbor & Pine HVAC",
      ownerName: "Avery Collins",
      contactEmail: client.email,
      contactPhone: "(918) 555-0142",
      businessCategory: "Residential HVAC",
      city: "Tulsa",
      state: "OK",
      serviceArea: "Tulsa metro and surrounding suburbs",
      websiteStatus: WebsiteStatus.MOSTLY_COMPLETE,
      websiteUrl: "https://www.harborpinehvac.com",
      googleBusinessProfileStatus: GoogleBusinessProfileStatus.CLAIMED_MOSTLY_COMPLETE,
      googleBusinessProfileUrl: "https://g.page/r/example",
      socialPlatforms: ["Facebook", "Instagram"],
      socialPresenceLevel: SocialPresenceLevel.ONE_ACTIVE,
      runsAdvertising: AdvertisingCadence.OCCASIONALLY,
      discoveryChannels: ["Google search", "Google Business Profile", "Referrals"],
      reviewStrength: ReviewStrength.SOME,
      reviewRequestCadence: ReviewRequestCadence.SOMETIMES,
      reviewCount: 24,
      averageRating: 4.6,
      desiredOutcomes: ["Calls", "Trust", "Visibility"],
      rawNotes:
        "We get good referral business, but newer customers say they found us online and I am not sure if the site is helping enough.",
      reportEmail: client.email,
      reportSentAt: new Date("2026-04-14T16:05:00.000Z"),
      score: 68,
      scoreTier: ScoreTier.SOLID_FOUNDATION_IMPROVEMENTS,
      summary:
        "Harbor & Pine HVAC looks credible online, but trust and consistency signals still leave room for improvement.",
      encouragement:
        "There is already enough traction here to build on. The next wins are about tightening consistency, not rebuilding everything.",
      strengths: [
        "A live website gives customers a credible place to evaluate the business.",
        "Google / local presence is established enough to support nearby discovery.",
        "Customers have a reasonably clear path to call or take the next step.",
      ],
      improvementAreas: [
        "Review cadence and proof visibility still need to become more consistent.",
        "Social activity exists but does not yet reinforce trust strongly enough.",
        "Service clarity and proof near the top of the site still have room to improve.",
      ],
      submittedAt: new Date("2026-04-14T16:00:00.000Z"),
      categoryScores: {
        create: [
          {
            category: AuditCategory.WEBSITE_PRESENCE,
            score: 15,
            note: "The site has a credible base, but clarity, proof, and polish still have room to improve.",
            displayOrder: 0,
          },
          {
            category: AuditCategory.GOOGLE_LOCAL_PRESENCE,
            score: 15,
            note: "Local presence has a usable foundation, but it still needs steadier upkeep and completeness.",
            displayOrder: 1,
          },
          {
            category: AuditCategory.REVIEWS_TRUST,
            score: 13,
            note: "Trust signals are present and useful, though there is still room to strengthen the review engine.",
            displayOrder: 2,
          },
          {
            category: AuditCategory.SOCIAL_BRAND_ACTIVITY,
            score: 11,
            note: "One social channel is doing a useful job, though the brand footprint is still fairly narrow.",
            displayOrder: 3,
          },
          {
            category: AuditCategory.CUSTOMER_ACTION_READINESS,
            score: 14,
            note: "Customers have a workable next-step path, though it could be clearer and easier.",
            displayOrder: 4,
          },
        ],
      },
    },
  });

  const audit = await prisma.manualAudit.create({
    data: {
      businessId: business.id,
      presenceCheckId: presenceCheck.id,
      authorId: consultant.id,
      publishedById: consultant.id,
      status: AuditStatus.PUBLISHED,
      title: "Harbor & Pine HVAC Presence Audit",
      executiveSummary:
        "The business has a credible online base but still needs stronger trust reinforcement and clearer service framing to convert more visitors confidently.",
      clientSummary:
        "You already have a solid presence foundation. The main opportunity is tightening the parts customers use to decide whether they trust you quickly.",
      internalSummary:
        "Good local base. Main consultant focus should be reviews, homepage proof, and clearer emergency-service CTAs.",
      strengths: [
        "The website already provides a credible starting point.",
        "Local visibility is present, which gives the business something meaningful to build on.",
      ],
      improvementOpportunities: [
        "Review cadence and proof visibility need to become more consistent.",
        "Social activity should reinforce trust with lighter but steadier updates.",
      ],
      nextSteps: [
        "Tighten service clarity and trust proof near the top of the website.",
        "Create a steadier review-request rhythm tied to completed jobs.",
        "Refresh Google profile details, photos, and response cadence.",
      ],
      publishedAt: new Date("2026-04-14T18:00:00.000Z"),
      sections: {
        create: [
          {
            category: AuditCategory.WEBSITE_PRESENCE,
            score: 15,
            headline: "Solid base with room for sharper conversion messaging",
            clientFacingNotes:
              "The site creates legitimacy, but service clarity and trust cues should do more work near the top of the page.",
            internalNotes:
              "Pull in stronger review proof and more obvious emergency-service routing.",
            displayOrder: 1,
          },
          {
            category: AuditCategory.GOOGLE_LOCAL_PRESENCE,
            score: 15,
            headline: "Good local footing that can be tightened",
            clientFacingNotes:
              "The profile is visible, which helps, but profile freshness and completeness still have upside.",
            internalNotes:
              "Photos, Q&A, service detail, and review responses are the fastest wins.",
            displayOrder: 2,
          },
          {
            category: AuditCategory.REVIEWS_TRUST,
            score: 13,
            headline: "Trust exists, but it is not reinforced enough yet",
            clientFacingNotes:
              "Reviews are present, but the cadence and presentation can still become a much stronger trust asset.",
            internalNotes:
              "Recommend a simple review-request flow tied to completed jobs.",
            displayOrder: 3,
          },
          {
            category: AuditCategory.SOCIAL_BRAND_ACTIVITY,
            score: 11,
            headline: "Visible but lighter than the business quality deserves",
            clientFacingNotes:
              "Social activity shows the business exists, but it does not yet reinforce credibility consistently.",
            internalNotes:
              "Use low-lift field updates and recent-job proof rather than volume.",
            displayOrder: 4,
          },
          {
            category: AuditCategory.CUSTOMER_ACTION_READINESS,
            score: 14,
            headline: "Customers can take the next step, but it can still feel easier",
            clientFacingNotes:
              "Customers can understand how to move forward, but more trust reinforcement should sit closer to the action path.",
            internalNotes:
              "Protect this strength while strengthening trust cues around the action path.",
            displayOrder: 5,
          },
        ],
      },
    },
  });

  const recommendedPlan = await prisma.servicePlan.findUniqueOrThrow({
    where: { slug: "visibility-care-plan" },
  });
  const localPlan = await prisma.servicePlan.findUniqueOrThrow({
    where: { slug: "gbp-boost" },
  });

  await prisma.planRecommendation.createMany({
    data: [
      {
        businessId: business.id,
        presenceCheckId: presenceCheck.id,
        auditId: audit.id,
        servicePlanId: recommendedPlan.id,
        rationale:
          "The business has enough foundation that ongoing consistency support would likely outperform a full rebuild.",
        priority: 1,
        status: RecommendationStatus.PRESENTED,
        clientVisible: true,
      },
      {
        businessId: business.id,
        presenceCheckId: presenceCheck.id,
        auditId: audit.id,
        servicePlanId: localPlan.id,
        rationale:
          "Local visibility already exists, so a focused GBP refresh could create a practical early win.",
        priority: 2,
        status: RecommendationStatus.PRESENTED,
        clientVisible: true,
      },
    ],
  });

  await prisma.internalNote.create({
    data: {
      businessId: business.id,
      presenceCheckId: presenceCheck.id,
      authorId: consultant.id,
      title: "Consultant direction",
      body:
        "Lead with steady, practical improvements. Avoid overselling website rebuild unless clarity updates still underperform after review and local cleanup.",
      pinned: true,
    },
  });

  await prisma.followUp.create({
    data: {
      businessId: business.id,
      presenceCheckId: presenceCheck.id,
      status: "QUEUED",
      channel: "email",
      subject: "Published audit follow-up",
      notes:
        "Share published audit with two honest plan options and invite questions instead of pressure.",
    },
  });

  await prisma.comprehensiveReportRequest.create({
    data: {
      businessId: business.id,
      presenceCheckId: presenceCheck.id,
      requestedById: client.id,
      status: "ACKNOWLEDGED",
      note: "Interested in a deeper consultant review if it stays practical and clearly scoped.",
    },
  });

  await prisma.notificationEvent.createMany({
    data: [
      {
        type: "SUBMISSION_CREATED",
        status: "LOGGED",
        businessId: business.id,
        presenceCheckId: presenceCheck.id,
        userId: client.id,
        channel: "log",
        recipient: client.email,
        subject: "Presence check submitted",
        processedAt: new Date("2026-04-14T16:00:00.000Z"),
      },
      {
        type: "AUDIT_PUBLISHED",
        status: "LOGGED",
        businessId: business.id,
        presenceCheckId: presenceCheck.id,
        auditId: audit.id,
        userId: consultant.id,
        channel: "log",
        recipient: client.email,
        subject: "Audit published to portal",
        processedAt: new Date("2026-04-14T18:00:00.000Z"),
      },
      {
        type: "FOLLOW_UP_QUEUED",
        status: "LOGGED",
        businessId: business.id,
        presenceCheckId: presenceCheck.id,
        auditId: audit.id,
        userId: consultant.id,
        channel: "log",
        recipient: client.email,
        subject: "Follow-up placeholder queued",
        processedAt: new Date("2026-04-14T18:00:00.000Z"),
      },
      {
        type: "COMPREHENSIVE_REPORT_REQUESTED",
        status: "LOGGED",
        businessId: business.id,
        presenceCheckId: presenceCheck.id,
        userId: client.id,
        channel: "log",
        recipient: client.email,
        subject: "Comprehensive report requested",
        processedAt: new Date("2026-04-14T18:10:00.000Z"),
      },
    ],
  });

  console.log("Virtura Presence phase 2 seed complete", {
    admin: admin.email,
    consultant: consultant.email,
    client: client.email,
    submissionId: presenceCheck.id,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
