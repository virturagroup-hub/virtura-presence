import { Text } from "@react-email/components";

import {
  EmailBulletList,
  EmailSectionHeading,
  EmailStatCard,
  VirturaEmailLayout,
} from "@/emails/virtura-layout";

type AuditPublishedEmailProps = {
  businessName: string;
  clientSummary: string;
  nextSteps: string[];
  recommendedPlans: string[];
  reportUrl: string;
};

export function AuditPublishedEmail({
  businessName,
  clientSummary,
  nextSteps,
  recommendedPlans,
  reportUrl,
}: AuditPublishedEmailProps) {
  return (
    <VirturaEmailLayout
      preview={`Your published audit for ${businessName} is ready.`}
      title="Your consultant-reviewed audit is now live"
      intro="A published manual audit is available in your client portal. It reflects consultant-reviewed, client-safe findings and practical next steps."
      action={{
        href: reportUrl,
        label: "View published report",
      }}
    >
      <EmailSectionHeading>Published summary</EmailSectionHeading>
      <EmailStatCard label={businessName} value={clientSummary} />

      {nextSteps.length ? (
        <>
          <EmailSectionHeading>Recommended next steps</EmailSectionHeading>
          <EmailBulletList items={nextSteps.slice(0, 3)} />
        </>
      ) : null}

      {recommendedPlans.length ? (
        <>
          <EmailSectionHeading>Suggested service options</EmailSectionHeading>
          <EmailBulletList items={recommendedPlans.slice(0, 3)} />
        </>
      ) : null}

      <Text style={bodyCopy}>
        The portal only shows client-safe content. Internal consultant notes remain
        separate and are never included in your published report.
      </Text>
    </VirturaEmailLayout>
  );
}

const bodyCopy = {
  color: "#475569",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "18px 0 0",
};
