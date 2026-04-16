import { buildQuickScore } from "@/lib/presence/score";
import { type PresenceCheckInput } from "@/lib/validations/presence-check";

type ScoreFixture = {
  name: string;
  input: PresenceCheckInput;
  minScore: number;
  maxScore: number;
  expectedTier: ReturnType<typeof buildQuickScore>["tier"];
};

function createInput(
  input: Partial<PresenceCheckInput>,
): PresenceCheckInput {
  return {
    businessName: "Fixture Business",
    ownerName: "Jordan Reed",
    email: "fixture@example.com",
    phone: "",
    businessCategory: "Residential HVAC",
    city: "Tulsa",
    state: "OK",
    serviceArea: "Tulsa metro",
    websiteStatus: "none",
    websiteUrl: "",
    googleBusinessProfileStatus: "not-sure",
    googleBusinessProfileUrl: "",
    socialPresenceLevel: "none",
    socialPlatforms: [],
    runsAdvertising: "no",
    goals: ["Calls", "Visibility"],
    discoveryChannels: ["Referrals"],
    reviewStrength: "none",
    reviewRequestCadence: "never",
    reviewCount: undefined,
    averageRating: undefined,
    notes: "",
    ...input,
  };
}

export const quickScoreFixtures: ScoreFixture[] = [
  {
    name: "no website no GBP no reviews",
    input: createInput({
      websiteStatus: "none",
      googleBusinessProfileStatus: "none",
      reviewStrength: "none",
      reviewRequestCadence: "never",
      socialPresenceLevel: "one-occasional",
      socialPlatforms: ["Facebook"],
      runsAdvertising: "no",
    }),
    minScore: 10,
    maxScore: 38,
    expectedTier: "Limited online foundation",
  },
  {
    name: "live site but weak local presence",
    input: createInput({
      websiteStatus: "mostly-complete",
      websiteUrl: "https://example.com",
      googleBusinessProfileStatus: "claimed-incomplete",
      googleBusinessProfileUrl: "https://g.page/example",
      reviewStrength: "few",
      reviewRequestCadence: "rarely",
      socialPresenceLevel: "one-active",
      socialPlatforms: ["Facebook"],
      phone: "(555) 555-0100",
      discoveryChannels: ["Website", "Referrals"],
    }),
    minScore: 40,
    maxScore: 64,
    expectedTier: "Basic foundation with clear gaps",
  },
  {
    name: "strong local presence but weak website",
    input: createInput({
      websiteStatus: "basic",
      websiteUrl: "https://example.com",
      googleBusinessProfileStatus: "active",
      googleBusinessProfileUrl: "https://g.page/example",
      reviewStrength: "strong",
      reviewRequestCadence: "regularly",
      reviewCount: 65,
      averageRating: 4.8,
      socialPresenceLevel: "one-active",
      socialPlatforms: ["Facebook"],
      phone: "(555) 555-0100",
      discoveryChannels: ["Google search", "Google Business Profile", "Referrals"],
    }),
    minScore: 55,
    maxScore: 79,
    expectedTier: "Solid foundation with improvement opportunities",
  },
  {
    name: "strong overall presence",
    input: createInput({
      websiteStatus: "polished",
      websiteUrl: "https://example.com",
      googleBusinessProfileStatus: "active",
      googleBusinessProfileUrl: "https://g.page/example",
      reviewStrength: "strong",
      reviewRequestCadence: "regularly",
      reviewCount: 120,
      averageRating: 4.9,
      socialPresenceLevel: "multiple-active",
      socialPlatforms: ["Facebook", "Instagram", "LinkedIn"],
      runsAdvertising: "yes",
      phone: "(555) 555-0100",
      discoveryChannels: [
        "Google search",
        "Google Business Profile",
        "Website",
        "Referrals",
      ],
      goals: ["Calls", "Leads", "Trust", "Visibility"],
    }),
    minScore: 85,
    maxScore: 100,
    expectedTier: "Strong online presence",
  },
];
