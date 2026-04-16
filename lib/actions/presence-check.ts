"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  createPresenceCheckSubmission,
  deliverPresenceCheckReport,
} from "@/lib/data/presence-checks";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import {
  presenceCheckSchema,
  presenceReportDeliverySchema,
  type PresenceCheckInput,
  type PresenceReportDeliveryInput,
} from "@/lib/validations/presence-check";

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
      error: toUserFacingDatabaseError(
        error,
        "The submission could not be saved right now.",
      ),
    };
  }
}

export async function sendPresenceCheckReportAction(
  values: PresenceReportDeliveryInput,
) {
  const parsed = presenceReportDeliverySchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "Please use a valid email address before sending the report.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await getCurrentUser();
    const result = await deliverPresenceCheckReport({
      ...parsed.data,
      currentUserId: user?.id,
    });

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
        "The free report could not be sent right now.",
      ),
    };
  }
}
