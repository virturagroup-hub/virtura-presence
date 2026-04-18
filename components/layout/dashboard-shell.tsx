import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { VirturaLogo } from "@/components/brand/virtura-logo";
import { DashboardMobileNavLoader } from "@/components/layout/dashboard-mobile-nav-loader";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { NavigationItem } from "@/lib/navigation";

type DashboardShellProps = {
  title: string;
  description: string;
  navigation: NavigationItem[];
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  children: ReactNode;
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

export function DashboardShell({
  title,
  description,
  navigation,
  user,
  children,
}: DashboardShellProps) {
  const mobileTitle = title === "Consultant Workspace" ? "Workspace" : title;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef4fc_0%,#f8fbff_100%)]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 lg:grid lg:min-h-screen lg:grid-cols-[280px_1fr] lg:gap-5 lg:px-6">
        <div className="surface-card flex items-center justify-between gap-4 px-4 py-4 lg:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <VirturaLogo />
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-semibold text-slate-950">{mobileTitle}</p>
              <p className="truncate text-[11px] text-slate-500">{user.email}</p>
            </div>
          </div>

          <DashboardMobileNavLoader
            title={title}
            description={description}
            navigation={navigation}
            user={user}
          />
        </div>

        <aside className="hidden overflow-hidden rounded-[32px] border border-slate-200/70 bg-slate-950 text-white shadow-[0_50px_100px_-50px_rgba(15,23,42,0.55)] lg:flex lg:flex-col">
          <div className="border-b border-white/10 p-6">
            <VirturaLogo compact tone="inverse" />
            <p className="mt-5 text-sm leading-7 text-slate-300">{description}</p>
          </div>

          <div className="flex-1 p-4">
            <DashboardNav navigation={navigation} />
          </div>

          <div className="border-t border-white/10 p-4">
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
              <LogoutButton className="w-full rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10" variant="outline" />
              <Button asChild className="w-full rounded-full">
                <Link href="/">Back to public site</Link>
              </Button>
            </div>
          </div>
        </aside>

        <main className="overflow-hidden rounded-[30px] border border-white/60 bg-white/74 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.38)] backdrop-blur-2xl">
          <div className="border-b border-slate-200/70 px-5 py-5 sm:px-7 sm:py-6">
            <p className="section-kicker">Workspace surface</p>
            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  {description}
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-7">{children}</div>
        </main>
      </div>
    </div>
  );
}
