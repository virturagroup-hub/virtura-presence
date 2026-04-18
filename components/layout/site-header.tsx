import Link from "next/link";

import { getCurrentUser, getDashboardPath } from "@/lib/auth";
import { SiteMobileNavLoader } from "@/components/layout/site-mobile-nav-loader";
import { VirturaLogo } from "@/components/brand/virtura-logo";
import { Button } from "@/components/ui/button";
import { marketingNavigation } from "@/lib/navigation";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const dashboardHref = getDashboardPath(user?.role);
  const dashboardLabel =
    user?.role === "ADMIN" || user?.role === "CONSULTANT" ? "Workspace" : "Portal";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl">
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

        <SiteMobileNavLoader
          navigation={marketingNavigation}
          actionHref={user?.email ? dashboardHref : "/sign-in"}
          actionLabel={user?.email ? `Open ${dashboardLabel}` : "Sign in"}
          signedIn={Boolean(user?.email)}
        />
      </div>
    </header>
  );
}
