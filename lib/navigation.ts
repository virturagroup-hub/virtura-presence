import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardCheck,
  Compass,
  FileText,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const marketingNavigation = [
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Plans", href: "/#service-plans" },
  { label: "FAQ", href: "/#faq" },
  { label: "Client Portal", href: "/portal" },
];

export const portalNavigation: NavigationItem[] = [
  {
    title: "Overview",
    href: "/portal",
    icon: LayoutGrid,
    description: "Quick assessment, status, and next steps.",
  },
  {
    title: "Published Report",
    href: "/portal/report",
    icon: FileText,
    description: "Client-facing audit summary and category findings.",
  },
];

export const workspaceNavigation: NavigationItem[] = [
  {
    title: "Pipeline",
    href: "/workspace",
    icon: BarChart3,
    description: "Lead volume, audit status, and consultant priorities.",
  },
  {
    title: "Review Queue",
    href: "/workspace#submission-list",
    icon: Users,
    description: "Search, filter, and open real submissions for review.",
  },
  {
    title: "Audit Studio",
    href: "/workspace#submission-list",
    icon: ClipboardCheck,
    description: "Draft, refine, and publish consultant-reviewed audits.",
  },
];

export const dashboardHighlights = [
  {
    title: "Honest Reviews",
    icon: ShieldCheck,
    description: "Every score and recommendation is built to be constructive.",
  },
  {
    title: "Practical Next Steps",
    icon: Compass,
    description: "Plans align to visible gaps, not pressure tactics.",
  },
  {
    title: "Consultant-Guided Delivery",
    icon: Sparkles,
    description: "AI assists draft creation, but consultants remain in control.",
  },
];
