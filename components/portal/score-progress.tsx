import { scoreTierLabel } from "@/lib/display";

type ScoreProgressProps = {
  trend: Array<{
    id: string;
    date: Date;
    score: number;
    businessName: string;
    tier: Parameters<typeof scoreTierLabel>[0];
  }>;
};

export function ScoreProgress({ trend }: ScoreProgressProps) {
  if (!trend.length) {
    return null;
  }

  const latest = trend[trend.length - 1];
  const previous = trend.length > 1 ? trend[trend.length - 2] : null;
  const delta = previous ? latest.score - previous.score : null;

  return (
    <section className="surface-card p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">Progress over time</p>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
            See how your presence checks are trending
          </h2>
        </div>
        <div className="rounded-[24px] border border-brand-100 bg-brand-50/80 px-4 py-3 text-sm text-brand-800">
          {delta === null
            ? "Your first saved score is now on record."
            : delta >= 0
              ? `${delta} point improvement since the previous saved check.`
              : `${Math.abs(delta)} point drop since the previous saved check.`}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.34fr_0.66fr]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/88 p-5">
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
            Latest score
          </p>
          <p className="mt-3 text-5xl font-semibold tracking-tight text-slate-950">
            {latest.score}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {scoreTierLabel(latest.tier) ?? "Quick score"}
          </p>
        </div>

        <div className="grid gap-3">
          {trend
            .slice()
            .reverse()
            .map((item, index) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-slate-200/70 bg-white/88 px-4 py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.businessName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {index !== 0 ? (
                      <div className="h-2 w-20 rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
                          style={{ width: `${Math.min(100, item.score)}%` }}
                        />
                      </div>
                    ) : null}
                    <div className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                      {item.score}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
