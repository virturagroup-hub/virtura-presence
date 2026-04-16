import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  submitted: "bg-brand-50 text-brand-700 ring-brand-100",
  "awaiting review": "bg-amber-50 text-amber-700 ring-amber-100",
  new: "bg-brand-50 text-brand-700 ring-brand-100",
  "pending review": "bg-amber-50 text-amber-700 ring-amber-100",
  "in review": "bg-sky-50 text-sky-700 ring-sky-100",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "follow-up sent": "bg-violet-50 text-violet-700 ring-violet-100",
  converted: "bg-teal-50 text-teal-700 ring-teal-100",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
  queued: "bg-slate-100 text-slate-700 ring-slate-200",
  scheduled: "bg-sky-50 text-sky-700 ring-sky-100",
  sent: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  replied: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  booked: "bg-teal-50 text-teal-700 ring-teal-100",
  requested: "bg-violet-50 text-violet-700 ring-violet-100",
  acknowledged: "bg-sky-50 text-sky-700 ring-sky-100",
  "in progress": "bg-brand-50 text-brand-700 ring-brand-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  declined: "bg-rose-50 text-rose-700 ring-rose-100",
};

type StatusBadgeProps = {
  value: string;
  className?: string;
};

export function StatusBadge({ value, className }: StatusBadgeProps) {
  const normalized = value.trim().toLowerCase();

  return (
    <Badge
      className={cn(
        "rounded-full border-0 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] uppercase ring-1",
        statusStyles[normalized] ?? "bg-slate-100 text-slate-700 ring-slate-200",
        className,
      )}
    >
      {value}
    </Badge>
  );
}
