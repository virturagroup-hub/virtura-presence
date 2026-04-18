"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VirturaLogo } from "@/components/brand/virtura-logo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type SiteMobileNavProps = {
  navigation: Array<{ label: string; href: string }>;
  actionHref: string;
  actionLabel: string;
  signedIn?: boolean;
};

export function SiteMobileNav({
  navigation,
  actionHref,
  actionLabel,
  signedIn = false,
}: SiteMobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-900 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.3)] transition hover:border-brand-200 hover:text-brand-700 lg:hidden">
        <Menu className="size-5" />
        <span className="sr-only">Open navigation</span>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[88vw] max-w-sm border-l border-slate-200/70 bg-white/96 px-0 backdrop-blur-2xl"
      >
        <SheetHeader className="border-b border-slate-200/70 px-5 py-5 text-left">
          <VirturaLogo />
          <SheetTitle className="mt-3 text-slate-950">Virtura Presence</SheetTitle>
          <SheetDescription className="text-slate-600">
            Honest online presence reviews with a clearer path from quick score to consultant follow-up.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-2 px-4 py-4">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-[22px] border border-slate-200/70 bg-white/92 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="mt-auto grid gap-3 border-t border-slate-200/70 px-5 py-5">
          <Button asChild variant="outline" className="rounded-full">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href={signedIn ? "/presence-check" : "/presence-check"}>Start Free Presence Check</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
