import { Section, Text } from "@react-email/components";

import {
  EmailBulletList,
  EmailSectionHeading,
  EmailStatCard,
  VirturaEmailLayout,
} from "@/emails/virtura-layout";

type SubmissionConfirmationEmailProps = {
  businessName: string;
  score: number;
  tierLabel: string;
  summary: string;
  encouragement?: string | null;
  strengths: string[];
  improvements: string[];
  categoryScores: Array<{
    label: string;
    score: number;
  }>;
  actionLabel: string;
  actionUrl: string;
};

export function SubmissionConfirmationEmail({
  businessName,
  score,
  tierLabel,
  summary,
  encouragement,
  strengths,
  improvements,
  categoryScores,
  actionLabel,
  actionUrl,
}: SubmissionConfirmationEmailProps) {
  return (
    <VirturaEmailLayout
      preview={`Your quick review for ${businessName} is ready.`}
      title={`Your quick review for ${businessName} is ready`}
      intro="We saved your presence check and generated a grounded first-pass summary. This is meant to be constructive, not manipulative."
      action={{
        href: actionUrl,
        label: actionLabel,
      }}
    >
      <EmailSectionHeading>Quick score</EmailSectionHeading>
      <EmailStatCard label="Overall score" value={`${score} · ${tierLabel}`} tone="brand" />
      <EmailStatCard label="Summary" value={summary} />

      {encouragement ? (
        <Text style={encouragementCopy}>{encouragement}</Text>
      ) : null}

      <EmailSectionHeading>What is helping</EmailSectionHeading>
      <EmailBulletList items={strengths.slice(0, 3)} tone="positive" />

      <EmailSectionHeading>What likely needs attention</EmailSectionHeading>
      <EmailBulletList items={improvements.slice(0, 3)} />

      <EmailSectionHeading>Category snapshot</EmailSectionHeading>
      <Section>
        {categoryScores.map((category) => (
          <EmailStatCard
            key={category.label}
            label={category.label}
            value={`${category.score}/20`}
          />
        ))}
      </Section>
    </VirturaEmailLayout>
  );
}

const encouragementCopy = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "22px",
  color: "#1e3a8a",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 24px",
  padding: "14px 16px",
};
