import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  consumeEmailVerificationToken,
  getEmailVerificationContext,
} from "@/lib/data/accounts";

type VerifyEmailPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { token } = await params;
  const verificationContext = await getEmailVerificationContext(token);

  if (!verificationContext) {
    notFound();
  }

  const isExpired = verificationContext.expiresAt < new Date();

  if (isExpired) {
    return (
      <section className="section-shell">
        <div className="surface-card max-w-3xl p-8">
          <p className="section-kicker">Email verification</p>
          <h1 className="mt-4 font-heading text-4xl font-semibold text-slate-950">
            This verification link has expired.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Sign in to your portal and request a fresh verification flow later if
            needed.
          </p>
          <Button asChild className="mt-6 rounded-full px-5">
            <Link href="/sign-in?callbackUrl=%2Fportal">Go to sign in</Link>
          </Button>
        </div>
      </section>
    );
  }

  const result = await consumeEmailVerificationToken(token);

  return (
    <section className="section-shell">
      <div className="surface-card max-w-3xl p-8">
        <p className="section-kicker">Email verification</p>
        <h1 className="mt-4 font-heading text-4xl font-semibold text-slate-950">
          {result.alreadyVerified
            ? "This email was already verified."
            : "Your email address is now verified."}
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          {result.email} is confirmed for {result.businessName}. You can continue into
          the Virtura Presence portal whenever you are ready.
        </p>
        <Button asChild className="mt-6 rounded-full px-5">
          <Link href="/sign-in?callbackUrl=%2Fportal">Open the client portal</Link>
        </Button>
      </div>
    </section>
  );
}
