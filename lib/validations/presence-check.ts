import { z } from "zod";

export const socialPlatformOptions = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "Nextdoor",
] as const;

export const discoveryChannelOptions = [
  "Google search",
  "Google Business Profile",
  "Website",
  "Referrals",
  "Social media",
  "Paid ads",
] as const;

export const goalOptions = [
  "Calls",
  "Leads",
  "Bookings",
  "Trust",
  "Visibility",
  "Reviews",
] as const;

export const websiteStatusOptions = [
  "none",
  "in-progress",
  "basic",
  "mostly-complete",
  "polished",
] as const;

export const googleBusinessProfileStatusOptions = [
  "none",
  "not-sure",
  "claimed-incomplete",
  "claimed-mostly-complete",
  "active",
] as const;

export const reviewStrengthOptions = [
  "none",
  "few",
  "some",
  "strong",
] as const;

export const reviewRequestCadenceOptions = [
  "never",
  "rarely",
  "sometimes",
  "regularly",
] as const;

export const socialPresenceLevelOptions = [
  "none",
  "one-occasional",
  "one-active",
  "multiple-active",
] as const;

export const advertisingCadenceOptions = ["yes", "no", "occasionally"] as const;

function optionalNumberField({ max, label }: { max: number; label: string }) {
  return z.number().min(0, `${label} cannot be negative.`).max(max, `${label} looks too high.`).optional();
}

export const presenceCheckSchema = z
  .object({
    businessName: z.string().min(2, "Business name is required."),
    ownerName: z.string().min(2, "Owner name is required."),
    email: z.email("Use a valid email address."),
    phone: z.string().optional(),
    businessCategory: z.string().min(2, "Business type or category is required."),
    city: z.string().min(2, "City is required."),
    state: z.string().min(2, "State is required."),
    serviceArea: z.string().min(2, "Service area helps make the audit more relevant."),
    websiteStatus: z.enum(websiteStatusOptions),
    websiteUrl: z.string().optional(),
    googleBusinessProfileStatus: z.enum(googleBusinessProfileStatusOptions),
    googleBusinessProfileUrl: z.string().optional(),
    socialPresenceLevel: z.enum(socialPresenceLevelOptions),
    socialPlatforms: z.array(z.enum(socialPlatformOptions)),
    runsAdvertising: z.enum(advertisingCadenceOptions),
    discoveryChannels: z
      .array(z.enum(discoveryChannelOptions))
      .min(1, "Pick at least one customer discovery channel."),
    reviewStrength: z.enum(reviewStrengthOptions),
    reviewRequestCadence: z.enum(reviewRequestCadenceOptions),
    reviewCount: optionalNumberField({ max: 50000, label: "Review count" }),
    averageRating: optionalNumberField({ max: 5, label: "Average rating" }),
    goals: z.array(z.enum(goalOptions)).min(1, "Choose at least one business goal."),
    notes: z.string().max(1000, "Keep notes under 1000 characters.").optional(),
  })
  .superRefine((values, ctx) => {
    const liveWebsiteStatuses = new Set(["basic", "mostly-complete", "polished"]);
    const liveGoogleProfileStatuses = new Set([
      "claimed-incomplete",
      "claimed-mostly-complete",
      "active",
    ]);

    if (liveWebsiteStatuses.has(values.websiteStatus) && !values.websiteUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["websiteUrl"],
        message: "Add the website URL so the review stays grounded in what customers see.",
      });
    }

    if (values.websiteUrl?.trim()) {
      const parsed = z.url().safeParse(values.websiteUrl);

      if (!parsed.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["websiteUrl"],
          message: "Use a complete website URL, including https:// if possible.",
        });
      }
    }

    if (
      liveGoogleProfileStatuses.has(values.googleBusinessProfileStatus) &&
      !values.googleBusinessProfileUrl?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["googleBusinessProfileUrl"],
        message: "Add the Google Business Profile link if the profile is live.",
      });
    }

    if (values.googleBusinessProfileUrl?.trim()) {
      const parsed = z.url().safeParse(values.googleBusinessProfileUrl);

      if (!parsed.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["googleBusinessProfileUrl"],
          message: "Use a complete Google Business Profile URL.",
        });
      }
    }

    if (values.socialPresenceLevel === "none" && values.socialPlatforms.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["socialPlatforms"],
        message: "Clear the platform list or choose a social activity level above none.",
      });
    }

    if (
      values.socialPresenceLevel !== "none" &&
      values.socialPlatforms.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["socialPlatforms"],
        message: "Pick at least one platform if you use social media.",
      });
    }

    if (values.averageRating !== undefined && values.reviewStrength === "none") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["averageRating"],
        message: "Average rating should be blank if there are no reviews yet.",
      });
    }

    if (values.reviewCount !== undefined && values.reviewStrength === "none" && values.reviewCount > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reviewCount"],
        message: "Review count should be zero or blank if there are no reviews yet.",
      });
    }
  });

export type PresenceCheckInput = z.output<typeof presenceCheckSchema>;
export type PresenceCheckFormInput = PresenceCheckInput;

export const presenceReportDeliverySchema = z.object({
  submissionId: z.string().min(1, "A submission is required."),
  reportEmail: z.email("Use a valid email address."),
});

export type PresenceReportDeliveryInput = z.infer<
  typeof presenceReportDeliverySchema
>;

export const presenceCheckDefaultValues: PresenceCheckFormInput = {
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  businessCategory: "",
  city: "",
  state: "",
  serviceArea: "",
  websiteStatus: "none",
  websiteUrl: "",
  googleBusinessProfileStatus: "not-sure",
  googleBusinessProfileUrl: "",
  socialPresenceLevel: "none",
  socialPlatforms: [],
  runsAdvertising: "no",
  discoveryChannels: ["Google search"],
  reviewStrength: "none",
  reviewRequestCadence: "never",
  reviewCount: undefined,
  averageRating: undefined,
  goals: ["Calls"],
  notes: "",
};
