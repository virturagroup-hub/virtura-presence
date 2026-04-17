import { redirect } from "next/navigation";

type SubmissionDetailPageProps = {
  params: Promise<{
    submissionId: string;
  }>;
};

export default async function SubmissionDetailPage({
  params,
}: SubmissionDetailPageProps) {
  const { submissionId } = await params;

  redirect(`/workspace/audit-studio?submissionId=${submissionId}`);
}
