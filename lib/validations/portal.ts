import {
  AdvertisingCadence,
  ComprehensiveReportRequestStatus,
  ReviewRequestCadence,
} from "@prisma/client";
import { z } from "zod";

function optionalUrlField(label: string) {
  return z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (!value?.trim()) {
        return;
      }

      const parsed = z.url().safeParse(value);

      if (!parsed.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} must be a complete URL.`,
        });
      }
    });
}

function optionalNumberField(max: number) {
  return z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return typeof value === "string" ? Number(value) : value;
    },
    z.number().min(0).max(max).optional(),
  );
}

export const portalProfileSchema = z.object({
  businessId: z.string().min(1),
  accountName: z.string().min(2, "Your name is required."),
  businessName: z.string().min(2, "Business name is required."),
  ownerName: z.string().min(2, "Owner or contact name is required."),
  businessCategory: z.string().min(2, "Business category is required."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  serviceArea: z.string().min(2, "Service area is required."),
  contactEmail: z.email("Use a valid contact email."),
  phone: z.string().optional(),
  websiteUrl: optionalUrlField("Website"),
  googleBusinessProfileUrl: optionalUrlField("Google Business Profile"),
  facebookUrl: optionalUrlField("Facebook"),
  instagramUrl: optionalUrlField("Instagram"),
  linkedinUrl: optionalUrlField("LinkedIn"),
  youtubeUrl: optionalUrlField("YouTube"),
  nextdoorUrl: optionalUrlField("Nextdoor"),
  businessDescription: z
    .string()
    .max(1500, "Keep the business description under 1500 characters.")
    .optional(),
  reviewCount: optionalNumberField(50000),
  averageRating: optionalNumberField(5),
  reviewRequestCadence: z.nativeEnum(ReviewRequestCadence),
  runsAdvertising: z.nativeEnum(AdvertisingCadence),
  goalsText: z.string().optional(),
});

export type PortalProfileInput = z.infer<typeof portalProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters for the new password."),
    confirmPassword: z.string().min(8, "Confirm the new password."),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "The new password confirmation does not match.",
      });
    }
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const comprehensiveReportRequestSchema = z.object({
  submissionId: z.string().min(1),
  note: z
    .string()
    .max(800, "Keep the request note under 800 characters.")
    .optional(),
});

export type ComprehensiveReportRequestInput = z.infer<
  typeof comprehensiveReportRequestSchema
>;

export const comprehensiveReportRequestStatusSchema = z.object({
  requestId: z.string().min(1),
  status: z.nativeEnum(ComprehensiveReportRequestStatus),
});

export type ComprehensiveReportRequestStatusInput = z.infer<
  typeof comprehensiveReportRequestStatusSchema
>;
