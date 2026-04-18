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
    <form className="surface-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="search"
          defaultValue={current.search}
          placeholder="Search business, email, area, or category"
          className="h-12 min-w-[220px] flex-[1.8_1_320px] rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
        />

        <select
          name="status"
          defaultValue={current.status ?? ""}
          className="h-12 min-w-[168px] flex-[0.9_1_188px] rounded-2xl border border-slate-200 bg-white/90 px-4 pr-10 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
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
          className="h-12 min-w-[190px] flex-[1_1_220px] rounded-2xl border border-slate-200 bg-white/90 px-4 pr-10 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
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
          className="h-12 min-w-[150px] flex-[0.85_1_180px] rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
        />

        <input
          type="text"
          name="state"
          defaultValue={current.state}
          placeholder="State"
          className="h-12 min-w-[120px] flex-[0.65_1_140px] rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
        />

        <select
          name="sort"
          defaultValue={current.sort ?? "newest"}
          className="h-12 min-w-[170px] flex-[0.85_1_190px] rounded-2xl border border-slate-200 bg-white/90 px-4 pr-10 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest_score">Highest score</option>
          <option value="lowest_score">Lowest score</option>
        </select>

        <div className="ml-auto flex flex-1 flex-wrap justify-end gap-3 min-[900px]:flex-[0_0_auto]">
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
      </div>
    </form>
  );
}
