"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AppRole } from "@/lib/auth";

type DemoUser = {
  label: string;
  email: string;
  password: string;
  role: AppRole;
};

type SignInFormProps = {
  callbackUrl: string;
  demoUsers: DemoUser[];
  showDemoCredentials: boolean;
  initialEmail?: string;
};

export function SignInForm({
  callbackUrl,
  demoUsers,
  showDemoCredentials,
  initialEmail,
}: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(
    initialEmail ?? (showDemoCredentials ? demoUsers[0]?.email : "") ?? "",
  );
  const [password, setPassword] = useState(
    showDemoCredentials ? demoUsers[0]?.password ?? "" : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const matchedKnownDemo = demoUsers.find(
      (user) => user.email.toLowerCase() === normalizedEmail,
    );
    const matchedDemo = demoUsers.find(
      (user) => user.email.toLowerCase() === normalizedEmail && user.password === password,
    );
    const resolvedCallbackUrl =
      callbackUrl === "/portal" && matchedDemo && matchedDemo.role !== "CLIENT"
        ? "/workspace"
        : callbackUrl;

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: resolvedCallbackUrl,
    });

    setIsPending(false);

    if (response?.error) {
      if (!showDemoCredentials && matchedKnownDemo) {
        setError(
          "Demo credentials are disabled in this environment. Set ENABLE_DEMO_AUTH=true for instant demo access, or run migrations and then seed demo users with `$env:SEED_DEMO_DATA=\"true\"; npm run db:seed`.",
        );
        return;
      }

      setError(
        "That sign-in did not go through. If migrations and seeded users have not been set up yet, the database may not have any login records yet.",
      );
      return;
    }

    const session = await getSession();
    const destination =
      callbackUrl === "/portal" && session?.user?.role && session.user.role !== "CLIENT"
        ? "/workspace"
        : response?.url ?? resolvedCallbackUrl;

    router.push(destination);
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="surface-card p-6 sm:p-8">
        <span className="section-kicker">Why sign in</span>
        <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
          Access the client portal or consultant workspace.
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The client portal is for viewing assessment summaries, published manual
          audits, and honest next-step recommendations. The internal workspace is
          for consultants reviewing leads, drafting reports, and publishing findings.
        </p>

        {!showDemoCredentials ? (
          <div className="mt-8 rounded-3xl border border-amber-200/70 bg-amber-50/72 p-5 text-sm leading-7 text-amber-900">
            Demo sign-in is off in this environment. Use the seeded admin or real account credentials for access here, and only enable demo users when you intentionally want a sample client or consultant flow.
          </div>
        ) : null}

        {showDemoCredentials ? (
          <div className="mt-8 space-y-4">
            <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
              Demo access
            </p>
            <div className="grid gap-3">
              {demoUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => {
                    setEmail(user.email);
                    setPassword(user.password);
                    setError(null);
                  }}
                  className="rounded-3xl border border-slate-200/70 bg-white/85 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_22px_45px_-35px_rgba(47,111,228,0.55)]"
                >
                  <p className="text-xs font-semibold tracking-[0.22em] text-brand-700 uppercase">
                    {user.label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{user.email}</p>
                  <p className="mt-1 text-xs text-slate-500">Password: {user.password}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="surface-card space-y-6 p-6 sm:p-8">
        <div>
          <span className="section-kicker">Secure sign-in</span>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
            Continue into Virtura Presence
          </h2>
        </div>

        <div className="space-y-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 rounded-2xl"
            placeholder="name@business.com"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-2xl"
            placeholder="Enter your password"
            required
          />
        </div>

        {error ? (
          <div className="rounded-[24px] border border-rose-100 bg-rose-50/82 px-4 py-3 text-sm leading-7 text-rose-700">
            {error}
          </div>
        ) : null}

        <Button type="submit" size="lg" className="h-12 w-full rounded-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
