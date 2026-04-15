import { Text } from "@react-email/components";

import {
  EmailSectionHeading,
  EmailStatCard,
  VirturaEmailLayout,
} from "@/emails/virtura-layout";

type FollowUpEmailProps = {
  businessName: string;
  note: string;
  portalUrl: string;
};

export function FollowUpEmail({
  businessName,
  note,
  portalUrl,
}: FollowUpEmailProps) {
  return (
    <VirturaEmailLayout
      preview={`Following up on your Virtura Presence review for ${businessName}.`}
      title="A quick follow-up on your presence review"
      intro="This is a simple follow-up, not a pressure sequence. If you want help prioritizing the next step, your portal still has the current report and recommendations."
      action={{
        href: portalUrl,
        label: "Open client portal",
      }}
    >
      <EmailSectionHeading>Current follow-up note</EmailSectionHeading>
      <EmailStatCard
        label={businessName}
        value={note || "Your audit is available whenever you want to revisit it."}
      />
      <Text style={bodyCopy}>
        If nothing needs attention right now, that is okay too. Virtura Presence is
        built to be useful even when the right answer is simply to keep your current
        foundation steady.
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
