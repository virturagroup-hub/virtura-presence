import { ScoreTier, SubmissionStatus } from "@prisma/client";

import { scoreTierLabels, submissionStatusLabels } from "@/lib/display";

type SubmissionFiltersProps = {
  basePath?: string;
  current: {
    search?: string;
    status?: SubmissionStatus;
    scoreTier?: ScoreTier;
    sort?: string;
    category?: string;
    state?: string;
  };
};

export function SubmissionFilters({
  basePath = "/workspace",
  current,
}: SubmissionFiltersProps) {
  return (
    <form className="surface-card grid gap-3 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.35fr)_repeat(4,minmax(0,0.82fr))_minmax(0,0.9fr)_auto]">
      <input
        type="text"
        name="search"
        defaultValue={current.search}
        placeholder="Search business, email, service area, or category"
        className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2 xl:min-w-[240px]"
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

      <select
        name="sort"
        defaultValue={current.sort ?? "newest"}
        className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="highest_score">Highest score</option>
        <option value="lowest_score">Lowest score</option>
      </select>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[auto_auto] xl:justify-self-end">
        <a
          href={basePath}
          className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-slate-950"
        >
          Clear
        </a>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-full bg-brand-500 px-6 text-sm font-semibold text-white shadow-[0_20px_40px_-25px_rgba(47,111,228,0.8)] transition hover:bg-brand-600"
        >
          Apply
        </button>
      </div>
    </form>
  );
}
