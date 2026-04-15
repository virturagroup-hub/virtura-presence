import { ScoreTier, SubmissionStatus } from "@prisma/client";

import { scoreTierLabels, submissionStatusLabels } from "@/lib/display";

type SubmissionFiltersProps = {
  current: {
    search?: string;
    status?: SubmissionStatus;
    scoreTier?: ScoreTier;
    sort?: string;
    category?: string;
    state?: string;
  };
};

export function SubmissionFilters({ current }: SubmissionFiltersProps) {
  return (
    <form className="surface-card grid gap-4 p-5 xl:grid-cols-[1.2fr_repeat(5,minmax(0,1fr))]">
      <input
        type="text"
        name="search"
        defaultValue={current.search}
        placeholder="Search business, email, service area, or category"
        className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
      />

      <select
        name="status"
        defaultValue={current.status ?? ""}
        className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
      >
        <option value="">All statuses</option>
        {Object.entries(submissionStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        name="scoreTier"
        defaultValue={current.scoreTier ?? ""}
        className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
      >
        <option value="">All score bands</option>
        {Object.entries(scoreTierLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <input
        type="text"
        name="category"
        defaultValue={current.category}
        placeholder="Business type"
        className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
      />

      <input
        type="text"
        name="state"
        defaultValue={current.state}
        placeholder="State"
        className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
      />

      <div className="flex gap-3">
        <select
          name="sort"
          defaultValue={current.sort ?? "newest"}
          className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest_score">Highest score</option>
          <option value="lowest_score">Lowest score</option>
        </select>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-full bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Apply
        </button>
      </div>
    </form>
  );
}
