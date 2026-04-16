"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  changePortalPassword,
  createComprehensiveReportRequest,
  updatePortalProfile,
} from "@/lib/data/portal";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import {
  changePasswordSchema,
  comprehensiveReportRequestSchema,
  portalProfileSchema,
  type ChangePasswordInput,
  type ComprehensiveReportRequestInput,
  type PortalProfileInput,
} from "@/lib/validations/portal";

async function requirePortalUser() {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("You need to be signed in to update portal settings.");
  }

  return user;
}

export async function updatePortalProfileAction(values: PortalProfileInput) {
  const parsed = portalProfileSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "The business profile still needs a few fixes.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await requirePortalUser();
    await updatePortalProfile(user.id, parsed.data);

    revalidatePath("/portal");
    revalidatePath("/portal/profile");
    revalidatePath("/workspace");

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      error: toUserFacingDatabaseError(error, "The business profile could not be updated."),
    };
  }
}

export async function changePortalPasswordAction(values: ChangePasswordInput) {
  const parsed = changePasswordSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "The password form needs a few fixes.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await requirePortalUser();
    await changePortalPassword(user.id, parsed.data);

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      error: toUserFacingDatabaseError(error, "The password could not be changed."),
    };
  }
}

export async function requestComprehensiveReportAction(
  values: ComprehensiveReportRequestInput,
) {
  const parsed = comprehensiveReportRequestSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "The comprehensive report request needs a quick fix.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await getCurrentUser();
    const request = await createComprehensiveReportRequest(user?.id, parsed.data);

    revalidatePath("/portal");
    revalidatePath("/portal/report");
    revalidatePath("/workspace");
    revalidatePath(`/workspace/submissions/${parsed.data.submissionId}`);

    return {
      success: true as const,
      requestId: request.id,
      status: request.status,
    };
  } catch (error) {
    return {
      success: false as const,
      error: toUserFacingDatabaseError(
        error,
        "The comprehensive report request could not be saved.",
      ),
    };
  }
}
