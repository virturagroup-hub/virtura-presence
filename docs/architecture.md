# Virtura Presence Architecture

Virtura Presence is structured as a premium lead-generation and assessment platform with three clear surfaces:

1. Marketing experience for lead capture and presence-check onboarding.
2. Client portal for viewing quick assessments, published audits, and recommended next steps.
3. Consultant workspace for reviewing submissions, drafting audits, tracking lead status, and recommending plans.

## Route Layout

```text
app/
  (marketing)/
    page.tsx
    presence-check/
      page.tsx
      results/page.tsx
  (auth)/
    sign-in/page.tsx
  (client)/
    portal/
      layout.tsx
      page.tsx
      report/page.tsx
  (workspace)/
    workspace/
      layout.tsx
      page.tsx
      submissions/[submissionId]/page.tsx
  api/auth/[...nextauth]/route.ts
```

## Shared Application Layers

- `components/brand`: Virtura identity primitives and logo treatment.
- `components/layout`: site chrome, dashboard shell, and reusable navigation structures.
- `components/shared`: design-language building blocks such as score panels, status badges, service cards, and audit blocks.
- `components/marketing`: homepage sections and supporting public-side presentation.
- `components/presence-check`: the multi-step assessment onboarding flow and preview state.
- `emails/*`: React Email templates for submission, verification, audit publication, and follow-up delivery.
- `lib/auth.ts`: role-aware NextAuth configuration, opt-in demo credentials, and route guards.
- `lib/email/*`: provider configuration and transport abstraction for Resend/local-dev email behavior.
- `lib/notification-delivery.tsx`: post-transaction notification processor that turns persisted events into outbound email.
- `lib/presence/score.ts`: constructive quick-score logic shared by the onboarding flow and future persistence endpoints.
- `lib/plan-catalog.ts`: source of truth for service-plan presentation and recommendation references.
- `prisma/schema.prisma`: long-term data model for users, businesses, assessments, audits, recommendations, and follow-up readiness.

## Data Model Intent

- `User`: role-aware accounts for clients, consultants, and admins.
- `Business`: canonical company profile and lead record.
- `PresenceCheck`: structured onboarding answers plus quick-score output.
- `ManualAudit` and `AuditSection`: consultant-reviewed audit content and publication state.
- `ServicePlan` and `PlanRecommendation`: reusable plan catalog plus business-specific recommendations.
- `InternalNote` and `FollowUp`: internal collaboration and nurture workflow readiness.
- `NotificationEvent` and `UserActionToken`: outbound delivery logging, claim flows, verification links, and future automation hooks.

## MVP Progression

- Phase 1: branded shell, homepage, presence-check flow, auth foundation, schema, and dashboard shells.
- Phase 2: submission persistence, score saving, client-facing results, consultant detail views, and publish flow.
- Infrastructure completion: PostgreSQL migration readiness, Resend integration, real transactional delivery, and notification replay tooling.
