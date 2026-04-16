import { cn } from "@/lib/utils";

type ScorePanelProps = {
  score: number;
  tier: string;
  summary: string;
  encouragement?: string;
  strengths?: string[];
  improvements?: string[];
  categories?: Array<{
    label: string;
    score: number;
  }>;
  className?: string;
};

export function ScorePanel({
  score,
  tier,
  summary,
  encouragement,
  strengths = [],
  improvements = [],
  categories = [],
  className,
}: ScorePanelProps) {
  const sweep = Math.max(10, Math.min(360, Math.round((score / 100) * 360)));

  return (
    <div className={cn("surface-card space-y-6 p-6 sm:p-7", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div
          className="relative grid size-32 place-items-center rounded-full p-3 shadow-[0_30px_60px_-30px_rgba(47,111,228,0.6)]"
          style={{
            background: `conic-gradient(rgba(47,111,228,0.95) 0deg ${sweep}deg, rgba(148,163,184,0.18) ${sweep}deg 360deg)`,
          }}
        >
          <div className="grid size-full place-items-center rounded-full bg-white/90 shadow-inner">
            <div className="text-center">
              <div className="text-4xl font-semibold tracking-tight text-slate-950">
                {score}
              </div>
              <div className="mt-1 text-[11px] font-semibold tracking-[0.28em] text-slate-500 uppercase">
                Score
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <span className="section-kicker">Quick read</span>
          <h3 className="font-heading text-2xl font-semibold text-slate-950">{tier}</h3>
          <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">{summary}</p>
          {encouragement ? (
            <p className="rounded-2xl border border-brand-100 bg-brand-50/80 px-4 py-3 text-sm text-brand-700">
              {encouragement}
            </p>
          ) : null}
        </div>
      </div>

      {categories.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.label}
              className="rounded-2xl border border-slate-200/70 bg-white/85 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">{category.label}</span>
                <span className="text-sm font-semibold text-slate-950">{category.score}/20</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
                  style={{ width: `${Math.min(100, category.score * 5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {(strengths.length || improvements.length) && (
        <div className={cn("grid gap-4", strengths.length && improvements.length ? "lg:grid-cols-2" : "")}>
          {strengths.length ? (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5">
              <p className="text-xs font-semibold tracking-[0.26em] text-emerald-700 uppercase">
                Helping you already
              </p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-emerald-900">
                {strengths.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          ) : null}
          {improvements.length ? (
            <div className="rounded-3xl border border-amber-100 bg-amber-50/80 p-5">
              <p className="text-xs font-semibold tracking-[0.26em] text-amber-700 uppercase">
                Likely needs attention
              </p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-amber-900">
                {improvements.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
