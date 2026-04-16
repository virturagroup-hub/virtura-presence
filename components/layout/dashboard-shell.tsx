import Link from "next/link";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { VirturaLogo } from "@/components/brand/virtura-logo";
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

function DashboardNav({
  navigation,
}: {
  navigation: NavigationItem[];
}) {
  return (
    <nav className="space-y-2">
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
              <p className="mt-1 text-xs leading-5 text-slate-300">{item.description}</p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
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
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 lg:grid lg:min-h-screen lg:grid-cols-[280px_1fr] lg:gap-5 lg:px-6">
        <div className="surface-card flex items-center justify-between gap-4 px-4 py-4 lg:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <VirturaLogo />
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-semibold text-slate-950">{title}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="size-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[88vw] max-w-sm border-l border-slate-200/70 bg-slate-950/96 px-0 text-white"
            >
              <SheetHeader className="border-b border-white/10 px-5 py-5 text-left">
                <VirturaLogo compact tone="inverse" />
                <SheetTitle className="mt-3 text-white">{title}</SheetTitle>
                <SheetDescription className="text-slate-300">
                  {description}
                </SheetDescription>
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
