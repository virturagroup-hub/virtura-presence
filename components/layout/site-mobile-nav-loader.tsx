"use client";

import dynamic from "next/dynamic";

const SiteMobileNav = dynamic(
  () =>
    import("@/components/layout/site-mobile-nav").then((module) => module.SiteMobileNav),
  { ssr: false },
);

type SiteMobileNavLoaderProps = {
  navigation: Array<{ label: string; href: string }>;
  actionHref: string;
  actionLabel: string;
  signedIn?: boolean;
};

export function SiteMobileNavLoader(props: SiteMobileNavLoaderProps) {
  return <SiteMobileNav {...props} />;
}
