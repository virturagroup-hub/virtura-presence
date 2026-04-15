import { hash } from "bcryptjs";
import {
  AuditCategory,
  AuditStatus,
  PrismaClient,
  RecommendationStatus,
  ReviewCollectionLevel,
  ScoreTier,
  SubmissionStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const shouldSeedDemoData = process.env.SEED_DEMO_DATA === "true";

  const plans = [
    {
      slug: "gbp-boost",
      name: "Google Business Profile Boost",
      tagline: "Sharpen local trust and discovery where nearby customers search first.",
      summary:
        "A focused cleanup and positioning package for businesses that need a stronger Google and local-presence foundation.",
      idealFor:
        "Service providers with inconsistent local visibility or incomplete profile coverage.",
      tierLabel: "Local visibility",
      accentColor: "from-brand-500/20 via-brand-500/8 to-cyan-300/20",
      deliverables: [
        "Profile review and completeness recommendations",
        "Category, services, and trust-signal optimization guidance",
        "Review-response and photo refresh checklist",
      ],
      outcomes: [
        "Better map-pack readiness",
        "Clearer trust signals",
        "Stronger local consistency",
      ],
      featured: false,
    },
    {
      slug: "quick-website-launch",
      name: "Quick Website Launch",
      tagline: "Create a clean, credible site foundation when the business needs clarity fast.",
      summary:
        "A streamlined website plan built for businesses that need a better front door before they spend more effort on visibility.",
      idealFor:
        "Businesses with no site, an outdated site, or unclear contact and service messaging.",
      tierLabel: "Website readiness",
      accentColor: "from-slate-900/85 via-slate-800/70 to-brand-700/70",
      deliverables: [
        "Messaging and service-clarity framework",
        "Contact-path and conversion structure",
        "Launch-ready page recommendations",
      ],
      outcomes: [
        "Stronger first impression",
        "Fewer drop-offs",
        "Cleaner call or lead paths",
      ],
      featured: false,
    },
    {
      slug: "visibility-care-plan",
      name: "Visibility Care Plan",
      tagline: "Maintain momentum with grounded, recurring visibility support.",
      summary:
        "An ongoing support plan for businesses that already have core channels in place but need steadier upkeep and refinement.",
      idealFor:
        "Owners who need consistency across reviews, local presence, and light brand activity.",
      tierLabel: "Ongoing support",
      accentColor: "from-sky-400/20 via-brand-500/10 to-white/20",
      deliverables: [
        "Monthly presence review and action list",
        "Review and profile consistency check-ins",
        "Channel-priority recommendations and follow-up notes",
      ],
      outcomes: [
        "Steadier visibility",
        "Clearer maintenance rhythm",
        "Lower effort for owners",
      ],
      featured: true,
    },
    {
      slug: "manual-comprehensive-audit",
      name: "Manual Comprehensive Audit",
      tagline:
        "Get a deeper, consultant-reviewed read on what is helping and what is holding you back.",
      summary:
        "A full manual review of key online presence signals for businesses that want sharper guidance before investing in changes.",
      idealFor:
        "Owners who want a thorough consultant perspective without a bloated SEO crawl.",
      tierLabel: "Deep review",
      accentColor: "from-indigo-500/20 via-brand-600/12 to-slate-900/20",
      deliverables: [
        "Manual website, local, review, and action-readiness audit",
        "Consultant summary with practical recommendations",
        "Prioritized service-plan guidance where it genuinely fits",
      ],
      outcomes: ["Clear diagnosis", "Honest priorities", "Better decision confidence"],
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

  if (!shouldSeedDemoData) {
    console.log("Virtura Presence base seed complete", {
      servicePlans: plans.length,
      demoData: false,
    });
    return;
  }

  const adminPassword = await hash(
    process.env.DEMO_ADMIN_PASSWORD ?? "VirturaAdmin!2026",
    10,
  );
  const consultantPassword = await hash(
    process.env.DEMO_CONSULTANT_PASSWORD ?? "VirturaConsultant!2026",
    10,
  );
  const clientPassword = await hash(
    process.env.DEMO_CLIENT_PASSWORD ?? "VirturaClient!2026",
    10,
  );

  const [admin, consultant, client] = await Promise.all([
    prisma.user.upsert({
      where: { email: process.env.DEMO_ADMIN_EMAIL ?? "admin@virturagroup.com" },
      update: { name: "Virtura Admin", role: "ADMIN", passwordHash: adminPassword },
      create: {
        email: process.env.DEMO_ADMIN_EMAIL ?? "admin@virturagroup.com",
        name: "Virtura Admin",
        role: "ADMIN",
        passwordHash: adminPassword,
      },
    }),
    prisma.user.upsert({
      where: {
        email: process.env.DEMO_CONSULTANT_EMAIL ?? "consultant@virturagroup.com",
      },
      update: {
        name: "Virtura Consultant",
        role: "CONSULTANT",
        passwordHash: consultantPassword,
      },
      create: {
        email: process.env.DEMO_CONSULTANT_EMAIL ?? "consultant@virturagroup.com",
        name: "Virtura Consultant",
        role: "CONSULTANT",
        passwordHash: consultantPassword,
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
      },
      create: {
        email: process.env.DEMO_CLIENT_EMAIL ?? "client@virturapresence.com",
        name: "Avery Collins",
        role: "CLIENT",
        passwordHash: clientPassword,
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
      discoveryChannels: ["Google search", "Google Business Profile", "Referrals"],
      goals: ["Calls", "Trust", "Visibility"],
      notes:
        "Referral business is strong, but the owner wants the online presence to work harder with new customers.",
      status: SubmissionStatus.PUBLISHED,
      quickScore: 74,
      quickTier: ScoreTier.PROMISING_UPSIDE,
      quickSummary:
        "A solid base exists, but trust and consistency signals still need work.",
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
      discoveryChannels: ["Google search", "Google Business Profile", "Referrals"],
      goals: ["Calls", "Trust", "Visibility"],
      notes:
        "Referral business is strong, but the owner wants the online presence to work harder with new customers.",
      status: SubmissionStatus.PUBLISHED,
      quickScore: 74,
      quickTier: ScoreTier.PROMISING_UPSIDE,
      quickSummary:
        "A solid base exists, but trust and consistency signals still need work.",
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
      hasWebsite: true,
      websiteUrl: "https://www.harborpinehvac.com",
      usesGoogleBusinessProfile: true,
      googleBusinessProfileUrl: "https://g.page/r/example",
      socialPlatforms: ["Facebook", "Instagram"],
      runsAdvertising: "OCCASIONALLY",
      discoveryChannels: ["Google search", "Google Business Profile", "Referrals"],
      collectsReviews: ReviewCollectionLevel.SOMEWHAT,
      desiredOutcomes: ["Calls", "Trust", "Visibility"],
      rawNotes:
        "We get good referral business, but newer customers say they found us online and I am not sure if the site is helping enough.",
      score: 74,
      scoreTier: ScoreTier.PROMISING_UPSIDE,
      summary:
        "Harbor & Pine HVAC looks legitimate and discoverable, but trust and conversion signals still feel uneven enough to cost calls.",
      encouragement:
        "There is already enough traction here to build on. The next wins are about tightening consistency, not rebuilding everything.",
      strengths: [
        "A real website is live and contact details are visible.",
        "Google Business Profile is present, so local trust has a foundation.",
        "Customers already find the business through more than one channel.",
      ],
      improvementAreas: [
        "Review collection is inconsistent, which weakens social proof.",
        "Social activity exists but does not yet reinforce trust consistently.",
        "Calls-to-action and service clarity likely need a more deliberate pass.",
      ],
      submittedAt: new Date("2026-04-14T16:00:00.000Z"),
      categoryScores: {
        create: [
          {
            category: AuditCategory.WEBSITE_PRESENCE,
            score: 15,
            note: "The foundation is there, but the site still needs sharper clarity and confidence cues.",
            displayOrder: 0,
          },
          {
            category: AuditCategory.GOOGLE_LOCAL_PRESENCE,
            score: 16,
            note: "Local signals are present, which is a strong starting point for nearby searches.",
            displayOrder: 1,
          },
          {
            category: AuditCategory.REVIEWS_TRUST,
            score: 13,
            note: "Trust signals exist, but they are not consistent enough yet to do all the selling for you.",
            displayOrder: 2,
          },
          {
            category: AuditCategory.SOCIAL_BRAND_ACTIVITY,
            score: 12,
            note: "The brand is visible, but activity feels lighter than the business quality deserves.",
            displayOrder: 3,
          },
          {
            category: AuditCategory.CUSTOMER_ACTION_READINESS,
            score: 18,
            note: "Customers can see how to move forward, which gives the presence real conversion potential.",
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
        "The business has real visibility traction but needs stronger trust reinforcement and clearer service framing to convert more visitors confidently.",
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
            score: 16,
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
            score: 12,
            headline: "Visible but lighter than the business quality deserves",
            clientFacingNotes:
              "Social activity shows the business exists, but it does not yet reinforce credibility consistently.",
            internalNotes:
              "Use low-lift field updates and recent-job proof rather than volume.",
            displayOrder: 4,
          },
          {
            category: AuditCategory.CUSTOMER_ACTION_READINESS,
            score: 18,
            headline: "Clear next steps are a real strength",
            clientFacingNotes:
              "Customers can understand how to move forward, which is one of the best parts of the current experience.",
            internalNotes:
              "Protect this while strengthening trust cues around the action path.",
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
