"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  createSubmissionInternalNote,
  updateSubmissionWorkflowStatus,
  upsertSubmissionAudit,
} from "@/lib/data/workspace";
import { updateComprehensiveReportRequestStatus } from "@/lib/data/portal";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import {
  auditEditorSchema,
  internalNoteSchema,
  submissionStatusUpdateSchema,
  type AuditEditorInput,
  type InternalNoteInput,
  type SubmissionStatusUpdateInput,
} from "@/lib/validations/audit";
import {
  comprehensiveReportRequestStatusSchema,
  type ComprehensiveReportRequestStatusInput,
} from "@/lib/validations/portal";

async function requireWorkspaceActor() {
  const user = await getCurrentUser();

  if (!user?.id || (user.role !== "CONSULTANT" && user.role !== "ADMIN")) {
    throw new Error("You do not have permission to modify consultant data.");
  }

  return user;
}

export async function saveSubmissionAuditAction(values: AuditEditorInput) {
  const parsed = auditEditorSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "The audit draft needs a few fixes before it can be saved.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const actor = await requireWorkspaceActor();
    const audit = await upsertSubmissionAudit(parsed.data, actor);

    revalidatePath("/workspace");
    revalidatePath(`/workspace/submissions/${parsed.data.submissionId}`);
    revalidatePath("/portal");
    revalidatePath("/portal/report");

    return {
      success: true as const,
      auditId: audit.id,
    };
  } catch (error) {
    return {
      success: false as const,
      error: toUserFacingDatabaseError(
        error,
        "The audit could not be updated right now.",
      ),
    };
  }
}

export async function updateSubmissionStatusAction(
  values: SubmissionStatusUpdateInput,
) {
  const parsed = submissionStatusUpdateSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "Status update is invalid.",
    };
  }

  try {
    const actor = await requireWorkspaceActor();
    await updateSubmissionWorkflowStatus({
      submissionId: parsed.data.submissionId,
      status: parsed.data.status,
      actorId: actor.id,
    });

    revalidatePath("/workspace");
    revalidatePath(`/workspace/submissions/${parsed.data.submissionId}`);
    revalidatePath("/portal");

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      error: toUserFacingDatabaseError(error, "Status could not be updated."),
    };
  }
}

export async function addSubmissionInternalNoteAction(values: InternalNoteInput) {
  const parsed = internalNoteSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "Internal note needs a little more detail.",
    };
  }

  try {
    const actor = await requireWorkspaceActor();
    await createSubmissionInternalNote({
      submissionId: parsed.data.submissionId,
      authorId: actor.id,
      title: parsed.data.title,
      body: parsed.data.body,
    });

    revalidatePath(`/workspace/submissions/${parsed.data.submissionId}`);

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      error: toUserFacingDatabaseError(
        error,
        "The internal note could not be saved.",
      ),
    };
  }
}

export async function updateComprehensiveRequestStatusAction(
  values: ComprehensiveReportRequestStatusInput,
) {
  const parsed = comprehensiveReportRequestStatusSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "Comprehensive report request status is invalid.",
    };
  }

  try {
    await requireWorkspaceActor();
    await updateComprehensiveReportRequestStatus(parsed.data);

    revalidatePath("/workspace");

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      error: toUserFacingDatabaseError(
        error,
        "The comprehensive report request could not be updated.",
      ),
    };
  }
}
