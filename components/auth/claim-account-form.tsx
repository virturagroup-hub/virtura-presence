"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { claimSubmissionAccountAction } from "@/lib/actions/account-claim";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ClaimAccountFormProps = {
  token: string;
  email: string;
  suggestedName: string;
};

export function ClaimAccountForm({
  token,
  email,
  suggestedName,
}: ClaimAccountFormProps) {
  const router = useRouter();
  const [name, setName] = useState(suggestedName);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await claimSubmissionAccountAction({
        token,
        name,
        password,
        confirmPassword,
      });

      if (!response.success) {
        setError(response.error);
        toast.error(response.error);
        return;
      }

      const signInResponse = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/portal",
      });

      if (signInResponse?.error) {
        toast.success("Account created. Sign in to access your portal.");
        router.push(`/sign-in?callbackUrl=%2Fportal&email=${encodeURIComponent(email)}`);
        return;
      }

      toast.success(
        "Your account is ready. A verification-ready token has also been queued for future email delivery.",
      );
      router.push("/portal");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card space-y-6 p-6 sm:p-8">
      <div>
        <span className="section-kicker">Create your client account</span>
        <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
          Save portal access for this submission
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          This account will be linked to the submission that used{" "}
          <span className="font-semibold text-slate-950">{email}</span>. Email
          verification is wired into the system and will send once Resend is configured
          for this environment.
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="claim-name">Your name</Label>
        <Input
          id="claim-name"
          className="h-12 rounded-2xl"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="claim-password">Create password</Label>
        <Input
          id="claim-password"
          type="password"
          className="h-12 rounded-2xl"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="claim-confirm">Confirm password</Label>
        <Input
          id="claim-confirm"
          type="password"
          className="h-12 rounded-2xl"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <Button type="submit" size="lg" className="h-12 w-full rounded-full" disabled={isPending}>
        {isPending ? "Creating your account..." : "Create my account"}
      </Button>
    </form>
  );
}
