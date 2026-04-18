import Link from "next/link";

import { VirturaLogo } from "@/components/brand/virtura-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/82 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.15fr_0.85fr_0.8fr] lg:px-8">
        <div className="space-y-5">
          <VirturaLogo />
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Virtura Presence is part of Virtura Group and is built for honest,
            practical online presence reviews without scare tactics or pressure-heavy
            sales language.
          </p>
          <div className="text-sm text-slate-600">
            <p>Contact: <a href="mailto:hello@virtura.us" className="font-medium text-slate-900 hover:text-brand-700">hello@virtura.us</a></p>
            <p className="mt-2">Copyright {new Date().getFullYear()} Virtura Group. All rights reserved.</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
            Navigation
          </p>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-950">
              Home
            </Link>
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

        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
            Legal
          </p>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <Link href="/privacy" className="hover:text-slate-950">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-950">
              Terms
            </Link>
            <p className="rounded-[24px] border border-slate-200/70 bg-slate-50/72 px-4 py-4 text-sm leading-7 text-slate-600">
              Service plans are recommendation-driven and may require consultation
              for custom scope.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
