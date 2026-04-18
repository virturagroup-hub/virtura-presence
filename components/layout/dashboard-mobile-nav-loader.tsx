"use client";

import dynamic from "next/dynamic";

import type { NavigationItem } from "@/lib/navigation";

const DashboardMobileNav = dynamic(
  () =>
    import("@/components/layout/dashboard-mobile-nav").then(
      (module) => module.DashboardMobileNav,
    ),
  { ssr: false },
);

type DashboardMobileNavLoaderProps = {
  title: string;
  description: string;
  navigation: NavigationItem[];
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
};

export function DashboardMobileNavLoader(props: DashboardMobileNavLoaderProps) {
  return <DashboardMobileNav {...props} />;
}
