"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardCheck,
  FileText,
  LayoutGrid,
  Settings2,
  UserRoundSearch,
} from "lucide-react";

import type { NavigationIcon, NavigationItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const navigationIcons: Record<NavigationIcon, typeof LayoutGrid> = {
  layoutGrid: LayoutGrid,
  fileText: FileText,
  settings2: Settings2,
  barChart3: BarChart3,
  clipboardCheck: ClipboardCheck,
  userRoundSearch: UserRoundSearch,
};

function isActivePath(pathname: string, href: string) {
  if (href === "/workspace") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({
  navigation,
}: {
  navigation: NavigationItem[];
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navigation.map((item) => {
        const Icon = navigationIcons[item.icon];
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex rounded-3xl border px-4 py-4 transition-all duration-300",
              active
                ? "border-brand-400/35 bg-white/12 shadow-[0_20px_35px_-30px_rgba(47,111,228,0.9)]"
                : "border-white/5 bg-white/5 hover:border-brand-400/30 hover:bg-white/10",
            )}
          >
            <Icon
              className={cn(
                "mt-1 size-5 transition-colors",
                active ? "text-white" : "text-brand-300",
              )}
            />
            <div className="ml-3">
              <p className={cn("text-sm font-semibold", active ? "text-white" : "text-white")}>
                {item.title}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5",
                  active ? "text-brand-100" : "text-slate-300",
                )}
              >
                {item.description}
              </p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
