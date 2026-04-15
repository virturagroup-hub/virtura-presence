"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { addSubmissionInternalNoteAction } from "@/lib/actions/workspace";

type InternalNoteFormProps = {
  submissionId: string;
};

export function InternalNoteForm({ submissionId }: InternalNoteFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="surface-card p-6">
      <p className="section-kicker">Internal notes</p>
      <h2 className="mt-4 font-heading text-2xl font-semibold text-slate-950">
        Add consultant-only context
      </h2>
      <div className="mt-5 space-y-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Optional note title"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          placeholder="Add internal observations, follow-up cues, or consultant guidance."
          className="w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
        />
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const response = await addSubmissionInternalNoteAction({
                submissionId,
                title,
                body,
              });

              if (!response.success) {
                toast.error(response.error);
                return;
              }

              setTitle("");
              setBody("");
              toast.success("Internal note saved.");
              router.refresh();
            })
          }
          className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Saving..." : "Add note"}
        </button>
      </div>
    </div>
  );
}
