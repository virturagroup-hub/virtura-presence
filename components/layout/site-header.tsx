import Link from "next/link";

import { VirturaLogo } from "@/components/brand/virtura-logo";
import { Button } from "@/components/ui/button";
import { marketingNavigation } from "@/lib/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/65 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="rounded-full">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild className="rounded-full px-5">
            <Link href="/presence-check">Start Free Presence Check</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
