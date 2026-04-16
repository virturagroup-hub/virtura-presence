"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  className?: string;
  variant?: "default" | "outline" | "ghost";
};

export function LogoutButton({
  className,
  variant = "outline",
}: LogoutButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="size-4" />
      Log out
    </Button>
  );
}
