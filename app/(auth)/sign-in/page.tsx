import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import {
  demoAuthEnabled,
  demoAuthUsers,
  getCurrentUser,
  getDashboardPath,
} from "@/lib/auth";

type SignInPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    email?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const user = await getCurrentUser();

  if (user?.email) {
    redirect(getDashboardPath(user.role));
  }

  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/portal";

  return (
    <section className="section-shell">
      <SignInForm
        callbackUrl={callbackUrl}
        demoUsers={demoAuthEnabled ? demoAuthUsers : []}
        showDemoCredentials={demoAuthEnabled}
        initialEmail={params.email}
      />
    </section>
  );
}
