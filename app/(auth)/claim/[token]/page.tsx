import Link from "next/link";
import { notFound } from "next/navigation";

import { ClaimAccountForm } from "@/components/auth/claim-account-form";
import { Button } from "@/components/ui/button";
import { getClaimSubmissionContext } from "@/lib/data/accounts";

type ClaimPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { token } = await params;
  const claimContext = await getClaimSubmissionContext(token);

  if (!claimContext) {
    notFound();
  }

  const isExpired = claimContext.expiresAt < new Date();
  const alreadyHasPassword = Boolean(claimContext.user?.passwordHash);
  const businessName = claimContext.submission?.businessName ?? "your business";

  return (
    <section className="section-shell">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card p-6 sm:p-8">
          <span className="section-kicker">Submission claim</span>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-slate-950">
            Claim portal access for {businessName}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This link ties your saved submission to a real client account so your
            portal, published audit, and future report delivery all stay under the
            right owner.
          </p>
        </div>

        {claimContext.consumedAt || isExpired || alreadyHasPassword ? (
          <div className="surface-card space-y-5 p-6 sm:p-8">
            <h2 className="font-heading text-3xl font-semibold text-slate-950">
              {claimContext.consumedAt
                ? "This claim link has already been used."
                : isExpired
                  ? "This claim link has expired."
                  : "This submission is already tied to an account."}
            </h2>
            <p className="text-sm leading-7 text-slate-600">
              Sign in with the email used for the submission to access the client
              portal, or request a fresh link later once outbound delivery is wired in.
            </p>
            <Button asChild className="rounded-full px-5">
              <Link
                href={`/sign-in?callbackUrl=%2Fportal&email=${encodeURIComponent(
                  claimContext.email,
                )}`}
              >
                Go to sign in
              </Link>
            </Button>
          </div>
        ) : (
          <ClaimAccountForm
            token={token}
            email={claimContext.email}
            suggestedName={
              claimContext.user?.name ??
              claimContext.submission?.ownerName ??
              businessName
            }
          />
        )}
      </div>
    </section>
  );
}
