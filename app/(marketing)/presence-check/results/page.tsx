import { PresenceCheckResults } from "@/components/presence-check/presence-check-results";
import { SectionHeading } from "@/components/shared/section-heading";

export default function PresenceCheckResultsPage() {
  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow="Quick score preview"
        title="An honest first-pass read on where your online foundation stands."
        description="This preview is meant to be constructive and believable. Missing fundamentals should read clearly as missing fundamentals, and the deeper audit remains manual, consultant-reviewed, and fully editable before publication."
      />
      <div className="mt-10">
        <PresenceCheckResults />
      </div>
    </section>
  );
}
