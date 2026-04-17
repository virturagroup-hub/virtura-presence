import { z } from "zod";

const emailEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  EMAIL_DELIVERY_MODE: z.enum(["auto", "log", "disabled"]).default("auto"),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  RESEND_FROM_NAME: z.string().min(1).default("Virtura Presence"),
  RESEND_REPLY_TO: z.string().email().optional(),
});

export function getEmailRuntimeConfig() {
  const parsed = emailEnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    EMAIL_DELIVERY_MODE: process.env.EMAIL_DELIVERY_MODE,
    RESEND_API_KEY: process.env.RESEND_API_KEY || undefined,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || undefined,
    RESEND_FROM_NAME: process.env.RESEND_FROM_NAME || undefined,
    RESEND_REPLY_TO: process.env.RESEND_REPLY_TO || undefined,
  });

  const resendReady = Boolean(parsed.RESEND_API_KEY && parsed.RESEND_FROM_EMAIL);
  const mode =
    parsed.EMAIL_DELIVERY_MODE === "log"
      ? "log"
      : parsed.EMAIL_DELIVERY_MODE === "disabled"
        ? "disabled"
        : resendReady
          ? "resend"
          : parsed.NODE_ENV === "production"
            ? "disabled"
            : "log";

  return {
    mode,
    resendApiKey: parsed.RESEND_API_KEY ?? null,
    fromEmail: parsed.RESEND_FROM_EMAIL ?? null,
    fromName: parsed.RESEND_FROM_NAME,
    from: parsed.RESEND_FROM_EMAIL
      ? `${parsed.RESEND_FROM_NAME} <${parsed.RESEND_FROM_EMAIL}>`
      : null,
    replyTo: parsed.RESEND_REPLY_TO,
  };
}

export function getEmailDeliverySummary() {
  const config = getEmailRuntimeConfig();

  if (config.mode === "resend") {
    return {
      mode: "resend" as const,
      label: "Live email delivery",
      description:
        "Messages are being rendered and sent through Resend with the configured sender identity.",
      canSend: true,
      from: config.from,
    };
  }

  if (config.mode === "log") {
    return {
      mode: "log" as const,
      label: "Local dev log mode",
      description:
        "Email actions stay usable, but messages are written to the server log instead of being delivered to a real inbox.",
      canSend: true,
      from: config.from,
    };
  }

  return {
    mode: "disabled" as const,
    label: "Email delivery unavailable",
    description:
      "Transactional email is disabled because Resend is not fully configured for this environment yet.",
    canSend: false,
    from: config.from,
  };
}
