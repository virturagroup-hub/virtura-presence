import { PresenceCheckFlow } from "@/components/presence-check/presence-check-flow";
import { SectionHeading } from "@/components/shared/section-heading";

export default function PresenceCheckPage() {
  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow="Free presence check"
        title="A guided first-pass review for how your business shows up online."
        description="Answer a focused set of questions, then receive an honest preview of what looks strong and what likely deserves attention next."
      />
      <div className="mt-10">
        <PresenceCheckFlow />
      </div>
    </section>
  );
}
