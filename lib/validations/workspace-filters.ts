import { ScoreTier, SubmissionStatus } from "@prisma/client";
import { z } from "zod";

export const workspaceSearchSchema = z.object({
  search: z.string().optional().default(""),
  status: z.nativeEnum(SubmissionStatus).optional(),
  scoreTier: z.nativeEnum(ScoreTier).optional(),
  sort: z.enum(["newest", "oldest", "highest_score", "lowest_score"]).default("newest"),
  category: z.string().optional().default(""),
  state: z.string().optional().default(""),
});

export type WorkspaceSearchInput = z.infer<typeof workspaceSearchSchema>;
