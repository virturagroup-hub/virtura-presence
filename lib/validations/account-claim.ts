import { z } from "zod";

export const claimSubmissionAccountSchema = z
  .object({
    token: z.string().min(20, "The claim link is invalid."),
    name: z.string().min(2, "Your name is required."),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[A-Z]/, "Include at least one uppercase letter.")
      .regex(/[a-z]/, "Include at least one lowercase letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

export type ClaimSubmissionAccountInput = z.infer<
  typeof claimSubmissionAccountSchema
>;
