import { PresenceCheckResults } from "@/components/presence-check/presence-check-results";
import { SectionHeading } from "@/components/shared/section-heading";

export default function PresenceCheckResultsPage() {
  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow="Quick score preview"
        title="A constructive read on what your current online presence is doing well."
        description="This preview is a helpful first pass, not a manipulative grade. The deeper audit remains manual, consultant-reviewed, and fully editable before publication."
      />
      <div className="mt-10">
        <PresenceCheckResults />
      </div>
    </section>
  );
}
