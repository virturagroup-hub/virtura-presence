import type { SubmissionStatus } from "@prisma/client";

type SessionUser = {
  id?: string;
  role?: "CLIENT" | "CONSULTANT" | "ADMIN";
};

export function canAccessSubmissionForClient(
  user: SessionUser,
  submission: {
    submittedById: string | null;
    business: {
      primaryContactId: string | null;
    };
  },
) {
  if (user.role === "ADMIN" || user.role === "CONSULTANT") {
    return true;
  }

  if (!user.id) {
    return false;
  }

  return (
    submission.submittedById === user.id ||
    submission.business.primaryContactId === user.id
  );
}

export function canUnpublishAudit(
  user: SessionUser,
  followUpStatuses: SubmissionStatus[] | string[],
) {
  if (user.role !== "ADMIN") {
    return false;
  }

  return !followUpStatuses.some((status) =>
    ["SENT", "REPLIED", "BOOKED"].includes(String(status)),
  );
}
