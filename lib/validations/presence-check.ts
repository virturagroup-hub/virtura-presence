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
    hasWebsite: z.enum(["yes", "no", "in-progress"]),
    websiteUrl: z.string().optional(),
    usesGoogleBusinessProfile: z.enum(["yes", "no", "not-sure"]),
    googleBusinessProfileUrl: z.string().optional(),
    socialPlatforms: z.array(z.enum(socialPlatformOptions)),
    runsAdvertising: z.enum(["yes", "no", "occasionally"]),
    discoveryChannels: z
      .array(z.enum(discoveryChannelOptions))
      .min(1, "Pick at least one customer discovery channel."),
    collectsReviews: z.enum(["yes", "somewhat", "not-yet"]),
    goals: z.array(z.enum(goalOptions)).min(1, "Choose at least one business goal."),
    notes: z.string().max(1000, "Keep notes under 1000 characters.").optional(),
  })
  .superRefine((values, ctx) => {
    if (values.hasWebsite === "yes" && !values.websiteUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["websiteUrl"],
        message: "Add the website URL so the review can stay grounded in what customers see.",
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
      values.usesGoogleBusinessProfile === "yes" &&
      !values.googleBusinessProfileUrl?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["googleBusinessProfileUrl"],
        message: "Add the Google Business Profile link if it is already live.",
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
  });

export type PresenceCheckInput = z.infer<typeof presenceCheckSchema>;

export const presenceCheckDefaultValues: PresenceCheckInput = {
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  businessCategory: "",
  city: "",
  state: "",
  serviceArea: "",
  hasWebsite: "yes",
  websiteUrl: "",
  usesGoogleBusinessProfile: "yes",
  googleBusinessProfileUrl: "",
  socialPlatforms: ["Facebook"],
  runsAdvertising: "occasionally",
  discoveryChannels: ["Google search"],
  collectsReviews: "somewhat",
  goals: ["Calls", "Trust"],
  notes: "",
};
