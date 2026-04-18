"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { VirturaLogo } from "@/components/brand/virtura-logo";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavigationItem } from "@/lib/navigation";

type DashboardMobileNavProps = {
  title: string;
  description: string;
  navigation: NavigationItem[];
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
};

function getInitials(name?: string | null) {
  if (!name) {
    return "VG";
  }

  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function DashboardMobileNav({
  title,
  description,
  navigation,
  user,
}: DashboardMobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-900 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.35)] transition hover:border-brand-200 hover:text-brand-700">
        <Menu className="size-5" />
        <span className="sr-only">Open navigation</span>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[88vw] max-w-sm border-l border-slate-200/70 bg-slate-950/96 px-0 text-white"
      >
        <SheetHeader className="border-b border-white/10 px-5 py-5 text-left">
          <VirturaLogo compact tone="inverse" />
          <SheetTitle className="mt-3 text-white">{title}</SheetTitle>
          <SheetDescription className="text-slate-300">{description}</SheetDescription>
        </SheetHeader>
        <div className="px-4 py-4">
          <DashboardNav navigation={navigation} />
        </div>
        <div className="mt-auto border-t border-white/10 px-5 py-5">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="border border-white/10 bg-brand-500/20">
                <AvatarFallback className="bg-transparent text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs text-slate-300">{user.email}</p>
              </div>
            </div>
            <p className="mt-4 text-[11px] font-semibold tracking-[0.24em] text-brand-200 uppercase">
              {user.role ?? "Account"}
            </p>
          </div>
          <div className="mt-4 grid gap-3">
            <LogoutButton className="w-full rounded-full" variant="outline" />
            <Button asChild className="w-full rounded-full">
              <Link href="/">Back to public site</Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
