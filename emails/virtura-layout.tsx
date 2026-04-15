import type { ReactNode } from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type VirturaEmailLayoutProps = {
  preview: string;
  title: string;
  intro: string;
  action?: {
    href: string;
    label: string;
  };
  supportEmail?: string;
  children: ReactNode;
};

export function VirturaEmailLayout({
  preview,
  title,
  intro,
  action,
  supportEmail = "support@virtura.us",
  children,
}: VirturaEmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={outer}>
          <Section style={brandHeader}>
            <Text style={eyebrow}>Virtura Presence</Text>
            <Text style={brandLine}>Honest online presence reviews</Text>
          </Section>

          <Section style={card}>
            <Heading style={heading}>{title}</Heading>
            <Text style={paragraph}>{intro}</Text>

            {action ? (
              <Button href={action.href} style={button}>
                {action.label}
              </Button>
            ) : null}

            <Hr style={divider} />
            {children}
          </Section>

          <Text style={footer}>
            No hype, no fluff, no pressure. If you need help, reply to{" "}
            <Link href={`mailto:${supportEmail}`} style={footerLink}>
              {supportEmail}
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailSectionHeading({ children }: { children: ReactNode }) {
  return <Text style={sectionHeading}>{children}</Text>;
}

export function EmailStatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "brand";
}) {
  return (
    <Section style={tone === "brand" ? statCardBrand : statCard}>
      <Text style={statLabel}>{label}</Text>
      <Text style={tone === "brand" ? statValueBrand : statValue}>{value}</Text>
    </Section>
  );
}

export function EmailBulletList({
  items,
  tone = "neutral",
}: {
  items: string[];
  tone?: "neutral" | "positive";
}) {
  return (
    <Section>
      {items.map((item) => (
        <Text
          key={item}
          style={tone === "positive" ? bulletPositive : bullet}
        >
          • {item}
        </Text>
      ))}
    </Section>
  );
}

const body = {
  backgroundColor: "#eff4fb",
  fontFamily:
    '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: "32px 16px",
};

const outer = {
  margin: "0 auto",
  maxWidth: "640px",
};

const brandHeader = {
  padding: "0 4px 16px",
};

const eyebrow = {
  color: "#0f172a",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "0.18em",
  margin: 0,
  textTransform: "uppercase" as const,
};

const brandLine = {
  color: "#4f6177",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "8px 0 0",
};

const card = {
  backgroundColor: "#ffffff",
  border: "1px solid #d6e4ff",
  borderRadius: "28px",
  boxShadow: "0 28px 60px -42px rgba(15, 23, 42, 0.38)",
  padding: "32px",
};

const heading = {
  color: "#0f172a",
  fontSize: "30px",
  fontWeight: "700",
  letterSpacing: "-0.03em",
  lineHeight: "38px",
  margin: "0 0 16px",
};

const paragraph = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "26px",
  margin: "0 0 20px",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "999px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "700",
  padding: "14px 22px",
  textDecoration: "none",
};

const divider = {
  borderColor: "#e2e8f0",
  margin: "28px 0",
};

const sectionHeading = {
  color: "#0f172a",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "0.16em",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
};

const statCard = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "22px",
  marginBottom: "12px",
  padding: "16px 18px",
};

const statCardBrand = {
  ...statCard,
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
};

const statLabel = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0 0 6px",
};

const statValue = {
  color: "#0f172a",
  fontSize: "18px",
  fontWeight: "700",
  lineHeight: "24px",
  margin: 0,
};

const statValueBrand = {
  ...statValue,
  color: "#1d4ed8",
};

const bullet = {
  color: "#475569",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 10px",
};

const bulletPositive = {
  ...bullet,
  color: "#065f46",
};

const footer = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "18px 4px 0",
};

const footerLink = {
  color: "#2563eb",
  textDecoration: "none",
};
