import Link from "next/link";
import { Menu } from "lucide-react";

import { getCurrentUser, getDashboardPath } from "@/lib/auth";
import { VirturaLogo } from "@/components/brand/virtura-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { marketingNavigation } from "@/lib/navigation";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const dashboardHref = getDashboardPath(user?.role);
  const dashboardLabel =
    user?.role === "ADMIN" || user?.role === "CONSULTANT" ? "Workspace" : "Portal";

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/72 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <VirturaLogo />

        <nav className="hidden items-center gap-6 lg:flex">
          {marketingNavigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user?.email ? (
            <Button variant="ghost" asChild className="rounded-full">
              <Link href={dashboardHref}>{dashboardLabel}</Link>
            </Button>
          ) : (
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
          <Button asChild className="rounded-full px-5">
            <Link href="/presence-check">Start Free Presence Check</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full lg:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Open navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[88vw] max-w-sm border-l border-slate-200/70 bg-white/94 px-0 backdrop-blur-2xl"
          >
            <SheetHeader className="border-b border-slate-200/70 px-5 py-5 text-left">
              <VirturaLogo />
              <SheetTitle className="mt-3">Virtura Presence</SheetTitle>
              <SheetDescription>
                Honest online presence reviews with a clearer path from quick score to consultant follow-up.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-2 px-4 py-4">
              {marketingNavigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-[22px] border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-slate-950"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto grid gap-3 border-t border-slate-200/70 px-5 py-5">
              {user?.email ? (
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={dashboardHref}>Open {dashboardLabel}</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              )}
              <Button asChild className="rounded-full">
                <Link href="/presence-check">Start Free Presence Check</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
