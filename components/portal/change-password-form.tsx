"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import { changePortalPasswordAction } from "@/lib/actions/portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const response = await changePortalPasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card p-6">
      <p className="section-kicker">Security</p>
      <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
        Change password
      </h2>
      <div className="mt-6 grid gap-5">
        <div className="space-y-3">
          <Label htmlFor="currentPassword">Current password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
      </div>
      <Button type="submit" className="mt-6 rounded-full px-5" disabled={isPending}>
        {isPending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
