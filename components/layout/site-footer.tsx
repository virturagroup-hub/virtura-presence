import Link from "next/link";

import { VirturaLogo } from "@/components/brand/virtura-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/70">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="space-y-5">
          <VirturaLogo />
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Honest online presence reviews for small businesses that want clarity,
            confidence, and practical next steps without hype.
          </p>
        </div>
        <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <Link href="/presence-check" className="hover:text-slate-950">
            Free Presence Check
          </Link>
          <Link href="/portal" className="hover:text-slate-950">
            Client Portal
          </Link>
          <Link href="/workspace" className="hover:text-slate-950">
            Consultant Workspace
          </Link>
          <Link href="/sign-in" className="hover:text-slate-950">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
