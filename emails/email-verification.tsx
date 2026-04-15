import { Text } from "@react-email/components";

import { EmailSectionHeading, VirturaEmailLayout } from "@/emails/virtura-layout";

type EmailVerificationEmailProps = {
  businessName: string;
  verifyUrl: string;
};

export function EmailVerificationEmail({
  businessName,
  verifyUrl,
}: EmailVerificationEmailProps) {
  return (
    <VirturaEmailLayout
      preview="Verify your email for Virtura Presence"
      title="Verify your email address"
      intro={`Confirm that this is the right inbox for ${businessName}. Once verified, future report and portal emails can route here with more confidence.`}
      action={{
        href: verifyUrl,
        label: "Verify my email",
      }}
    >
      <EmailSectionHeading>Why this matters</EmailSectionHeading>
      <Text style={bodyCopy}>
        This keeps your client portal access and future audit delivery tied to the right
        owner. If you did not request this, you can safely ignore the message.
      </Text>
    </VirturaEmailLayout>
  );
}

const bodyCopy = {
  color: "#475569",
  fontSize: "14px",
  lineHeight: "24px",
  margin: 0,
};
