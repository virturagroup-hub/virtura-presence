type AuditCategoryBlockProps = {
  category: string;
  score: number;
  headline: string;
  clientNotes: string;
  internalNotes?: string;
  showInternalNotes?: boolean;
};

export function AuditCategoryBlock({
  category,
  score,
  headline,
  clientNotes,
  internalNotes,
  showInternalNotes = false,
}: AuditCategoryBlockProps) {
  return (
    <article className="surface-card space-y-5 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
            {category}
          </p>
          <h3 className="mt-3 font-heading text-2xl font-semibold text-slate-950">
            {headline}
          </h3>
        </div>
        <div className="rounded-3xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-center">
          <div className="text-3xl font-semibold text-slate-950">{score}</div>
          <div className="text-[11px] font-semibold tracking-[0.24em] text-brand-700 uppercase">
            Category score
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-5">
        <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
          Client-facing notes
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-700">{clientNotes}</p>
      </div>

      {showInternalNotes && internalNotes ? (
        <div className="rounded-3xl border border-amber-100 bg-amber-50/80 p-5">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-700 uppercase">
            Internal consultant notes
          </p>
          <p className="mt-3 text-sm leading-7 text-amber-900">{internalNotes}</p>
        </div>
      ) : null}
    </article>
  );
}
