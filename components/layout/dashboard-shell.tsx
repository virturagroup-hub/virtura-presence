import Link from "next/link";
import type { ReactNode } from "react";

import { VirturaLogo } from "@/components/brand/virtura-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { NavigationItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

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
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef4fc_0%,#f8fbff_100%)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[300px_1fr] lg:px-6">
        <aside className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-slate-950 text-white shadow-[0_50px_100px_-50px_rgba(15,23,42,0.55)]">
          <div className="border-b border-white/10 p-6">
            <VirturaLogo compact tone="inverse" />
            <p className="mt-6 text-sm leading-7 text-slate-300">
              {description}
            </p>
          </div>

          <nav className="space-y-2 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex rounded-3xl border border-white/5 bg-white/5 px-4 py-4 transition-all duration-300 hover:border-brand-400/30 hover:bg-white/10",
                  )}
                >
                  <Icon className="mt-1 size-5 text-brand-300" />
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="border border-white/10 bg-brand-500/20">
                  <AvatarFallback className="bg-transparent text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-300">{user.email}</p>
                </div>
              </div>
              <p className="mt-4 text-[11px] font-semibold tracking-[0.24em] text-brand-200 uppercase">
                {user.role ?? "Account"}
              </p>
            </div>
            <Button asChild className="mt-4 w-full rounded-full">
              <Link href="/">Back to public site</Link>
            </Button>
          </div>
        </aside>

        <main className="overflow-hidden rounded-[36px] border border-white/60 bg-white/70 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.38)] backdrop-blur-2xl">
          <div className="border-b border-slate-200/70 px-6 py-6 sm:px-8">
            <p className="section-kicker">Workspace surface</p>
            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  {description}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
