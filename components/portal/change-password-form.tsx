"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import { changePortalPasswordAction } from "@/lib/actions/portal";
import { Button } from "@/components/ui/button";
import {
  WorkspaceField,
  WorkspaceInput,
  WorkspaceSection,
} from "@/components/workspace/workspace-primitives";

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
    <form onSubmit={handleSubmit}>
      <WorkspaceSection
        kicker="Security"
        title="Change password"
        description="Update your portal password without changing the business record already linked to this account."
        actions={
          <Button type="submit" className="rounded-full px-5" disabled={isPending}>
            {isPending ? "Updating..." : "Update password"}
          </Button>
        }
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <WorkspaceField label="Current password">
            <WorkspaceInput
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          </WorkspaceField>
          <WorkspaceField label="New password">
            <WorkspaceInput
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          </WorkspaceField>
          <WorkspaceField label="Confirm new password">
            <WorkspaceInput
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          </WorkspaceField>
        </div>
      </WorkspaceSection>
    </form>
  );
}
