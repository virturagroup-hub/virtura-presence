import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardCheck,
  Compass,
  FileText,
  LayoutGrid,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
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
  {
    title: "Profile & Security",
    href: "/portal/profile",
    icon: Settings2,
    description: "Business details, contact data, and password settings.",
  },
];

export const workspaceNavigation: NavigationItem[] = [
  {
    title: "Pipeline",
    href: "/workspace",
    icon: BarChart3,
    description: "Company pipeline, grouped submissions, lifecycle, and next actions.",
  },
  {
    title: "Audit Studio",
    href: "/workspace/audit-studio",
    icon: ClipboardCheck,
    description: "Draft, refine, publish, and resend consultant-reviewed audits.",
  },
  {
    title: "Clients",
    href: "/workspace/clients",
    icon: UserRoundSearch,
    description: "Open company records, history, notes, and ongoing care context.",
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
