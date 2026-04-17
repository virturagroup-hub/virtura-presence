import type { ComponentProps, ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type WorkspaceSectionProps = {
  kicker?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: "default" | "muted" | "brand";
};

const sectionToneStyles = {
  default: "border-slate-200/70 bg-white/90",
  muted: "border-slate-200/70 bg-slate-50/82",
  brand: "border-brand-100 bg-brand-50/75",
} satisfies Record<NonNullable<WorkspaceSectionProps["tone"]>, string>;

export function WorkspaceSection({
  kicker,
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  tone = "default",
}: WorkspaceSectionProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border p-5 shadow-[0_28px_60px_-44px_rgba(15,23,42,0.28)] sm:p-6",
        sectionToneStyles[tone],
        className,
      )}
    >
      {kicker || title || description || actions ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {kicker ? <p className="section-kicker">{kicker}</p> : null}
            {title ? (
              <h3 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-slate-950">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}

      <div className={cn(kicker || title || description || actions ? "mt-5" : "", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

export function WorkspaceField({
  label,
  helper,
  children,
  className,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
          {label}
        </p>
        {helper ? <p className="mt-2 text-xs leading-6 text-slate-500">{helper}</p> : null}
      </div>
      {children}
    </div>
  );
}

const workspaceControlClasses =
  "rounded-[22px] border-slate-200/80 bg-white/96 text-slate-900 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.2)] focus-visible:border-brand-300 focus-visible:ring-4 focus-visible:ring-brand-100/80";

export function WorkspaceInput({
  className,
  ...props
}: ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn("h-12 px-4", workspaceControlClasses, className)}
      {...props}
    />
  );
}

export function WorkspaceTextarea({
  className,
  rows = 5,
  ...props
}: ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      rows={rows}
      className={cn(
        "min-h-[152px] resize-y px-4 py-3 leading-7",
        workspaceControlClasses,
        className,
      )}
      {...props}
    />
  );
}

export function WorkspaceSelect({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-12 w-full rounded-[22px] border border-slate-200/80 bg-white/96 px-4 text-sm text-slate-900 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.2)] outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100/80 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function WorkspaceChip({
  active = false,
  children,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase transition",
        active
          ? "border-brand-200 bg-brand-50 text-brand-700 shadow-[0_16px_36px_-24px_rgba(47,111,228,0.4)]"
          : "border-slate-200/80 bg-white/92 text-slate-600",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function WorkspaceEmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-dashed border-slate-300 bg-white/75 px-5 py-6 text-center",
        className,
      )}
    >
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function WorkspaceActionFooter({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-4 z-20 rounded-[28px] border border-slate-200/80 bg-white/92 px-5 py-4 shadow-[0_34px_80px_-42px_rgba(15,23,42,0.34)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
            {title}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">{children}</div>
      </div>
    </div>
  );
}
