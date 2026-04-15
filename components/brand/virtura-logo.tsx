import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type VirturaLogoProps = {
  compact?: boolean;
  className?: string;
  tone?: "default" | "inverse";
};

export function VirturaLogo({
  compact = false,
  className,
  tone = "default",
}: VirturaLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-3 rounded-full px-3 py-2 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5",
        tone === "default"
          ? "border border-white/70 bg-white/70 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.45)]"
          : "border border-white/10 bg-white/10 shadow-none",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex size-11 items-center justify-center overflow-hidden rounded-2xl",
          tone === "default"
            ? "bg-gradient-to-br from-brand-500/20 via-white to-brand-100"
            : "bg-gradient-to-br from-brand-400/20 via-white/10 to-brand-500/25",
        )}
      >
        <Image
          src="/assets/branding/Logo.png"
          alt="Virtura Group mark"
          width={30}
          height={30}
          className="h-auto w-auto"
          priority
        />
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-heading text-sm font-semibold tracking-[0.2em] uppercase",
            tone === "default" ? "text-slate-500" : "text-slate-300",
          )}
        >
          Virtura Group
        </span>
        {!compact ? (
          <span
            className={cn(
              "mt-1 text-base font-semibold",
              tone === "default" ? "text-slate-950" : "text-white",
            )}
          >
            Virtura Presence
          </span>
        ) : null}
      </div>
    </Link>
  );
}
