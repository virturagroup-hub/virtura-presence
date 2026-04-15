import { prisma } from "@/lib/prisma";

export async function getPortalDashboardData(userId: string) {
  const submissions = await prisma.presenceCheck.findMany({
    where: {
      OR: [{ submittedById: userId }, { business: { primaryContactId: userId } }],
    },
    orderBy: {
      submittedAt: "desc",
    },
    include: {
      business: true,
      categoryScores: {
        orderBy: {
          displayOrder: "asc",
        },
      },
      audit: {
        include: {
          sections: {
            orderBy: {
              displayOrder: "asc",
            },
          },
          planRecommendations: {
            where: {
              clientVisible: true,
            },
            include: {
              servicePlan: true,
            },
            orderBy: {
              priority: "asc",
            },
          },
        },
      },
      planRecommendations: {
        where: {
          clientVisible: true,
        },
        include: {
          servicePlan: true,
        },
        orderBy: {
          priority: "asc",
        },
      },
      followUps: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const latestSubmission = submissions[0] ?? null;

  return {
    submissions,
    latestSubmission,
    latestPublishedAudit:
      submissions.find((submission) => submission.audit?.status === "PUBLISHED")?.audit ??
      null,
  };
}
