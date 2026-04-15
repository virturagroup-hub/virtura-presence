"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { createPresenceCheckSubmission } from "@/lib/data/presence-checks";
import { presenceCheckSchema, type PresenceCheckInput } from "@/lib/validations/presence-check";

export async function submitPresenceCheckAction(values: PresenceCheckInput) {
  const parsed = presenceCheckSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "The submission is missing a few required details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await getCurrentUser();
    const result = await createPresenceCheckSubmission(parsed.data, {
      currentUserId: user?.id,
    });

    revalidatePath("/workspace");
    revalidatePath("/portal");

    return {
      success: true as const,
      result,
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "The submission could not be saved right now.",
    };
  }
}
