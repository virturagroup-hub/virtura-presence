"use server";

import { revalidatePath } from "next/cache";

import { claimSubmissionAccount } from "@/lib/data/accounts";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import {
  claimSubmissionAccountSchema,
  type ClaimSubmissionAccountInput,
} from "@/lib/validations/account-claim";

export async function claimSubmissionAccountAction(
  values: ClaimSubmissionAccountInput,
) {
  const parsed = claimSubmissionAccountSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "The account setup form needs a few fixes.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await claimSubmissionAccount(parsed.data);

    revalidatePath("/portal");
    revalidatePath("/workspace");

    return {
      success: true as const,
      result,
    };
  } catch (error) {
    return {
      success: false as const,
      error: toUserFacingDatabaseError(
        error,
        "The account could not be set up right now.",
      ),
    };
  }
}
