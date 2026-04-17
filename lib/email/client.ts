import type { ReactElement } from "react";
import { render, toPlainText } from "@react-email/render";
import { Resend } from "resend";

import { getEmailRuntimeConfig } from "@/lib/email/config";

let resendClient: Resend | null = null;

function getResendClient(apiKey: string) {
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export type TransactionalEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
};

export type TransactionalEmailResult =
  | {
      ok: true;
      channel: string;
      providerMessageId?: string | null;
    }
  | {
      ok: false;
      channel: string;
      error: string;
    };

export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
): Promise<TransactionalEmailResult> {
  const config = getEmailRuntimeConfig();

  if (config.mode === "log") {
    console.info("[virtura-email:dev-log]", {
      to: input.to,
      from: config.from,
      subject: input.subject,
    });

    return {
      ok: true,
      channel: "dev-log",
    };
  }

  if (config.mode === "disabled" || !config.resendApiKey || !config.from) {
    return {
      ok: false,
      channel: "email",
      error:
        "Transactional email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL, or use EMAIL_DELIVERY_MODE=log locally.",
    };
  }

  try {
    const html = await render(input.react);
    const text = toPlainText(html);
    const resend = getResendClient(config.resendApiKey);
    const response = await resend.emails.send({
      from: config.from,
      to: input.to,
      subject: input.subject,
      html,
      text,
      replyTo: input.replyTo ?? config.replyTo,
    });

    if (response.error) {
      return {
        ok: false,
        channel: "email",
        error: response.error.message,
      };
    }

    return {
      ok: true,
      channel: "email",
      providerMessageId: response.data?.id ?? null,
    };
  } catch (error) {
    return {
      ok: false,
      channel: "email",
      error:
        error instanceof Error
          ? error.message
          : "Email delivery failed before Resend returned a result.",
    };
  }
}
