import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CircleCheckBig,
  Compass,
  MapPinned,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { ScorePanel } from "@/components/shared/score-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { ServicePlanCard } from "@/components/shared/service-plan-card";
import { Button } from "@/components/ui/button";
import { demoAssessment } from "@/lib/demo-data";
import { servicePlans } from "@/lib/plan-catalog";

const philosophy = [
  {
    icon: ShieldCheck,
    title: "Constructive by design",
    description:
      "Virtura Presence is built to tell businesses what is working, not just what is missing.",
  },
  {
    icon: Compass,
    title: "Grounded in reality",
    description:
      "Recommendations stay practical, scoped to visible gaps, and tied to real customer trust signals.",
  },
  {
    icon: Sparkles,
    title: "Consultant-guided delivery",
    description:
      "AI helps accelerate drafting, but final audits remain human-reviewed and fully editable.",
  },
];

const steps = [
  {
    title: "Answer a short guided check-in",
    description:
      "Share your business basics, key channels, and what you want more of so the review has useful context.",
  },
  {
    title: "Get an encouraging first-pass score",
    description:
      "See a grounded summary of what is helping your presence and what likely deserves attention next.",
  },
  {
    title: "Receive a consultant-ready next step",
    description:
      "If deeper help makes sense, Virtura can deliver a manual audit and practical plan recommendations.",
  },
];

const commonGaps = [
  "A business looks capable in person, but the website and Google profile do not reflect that confidence yet.",
  "Customers can find the company, but reviews and proof points are too thin to build trust quickly.",
  "Social channels exist, but they do not consistently reinforce that the business is active and credible.",
  "The business gets referrals, yet the online presence still does not turn new traffic into calls cleanly.",
];

const faqs = [
  {
    question: "Is this an SEO grader or a scare tactic score?",
    answer:
      "No. The quick score is a helpful first-pass review meant to show visible strengths and likely gaps without pressure language or fake urgency.",
  },
  {
    question: "Does Virtura Presence replace a full consultant review?",
    answer:
      "No. The deeper audit is manual and consultant-reviewed. AI can help draft findings internally, but the final report stays consultant-controlled.",
  },
  {
    question: "Do I need to buy a service plan after using the free check?",
    answer:
      "No. The platform is designed to be honest about when a business is already doing well or when only a focused improvement is needed.",
  },
];

export function Homepage() {
  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <div className="hero-orb -left-20 top-18 h-72 w-72" />
        <div className="hero-orb right-0 top-40 h-96 w-96 opacity-75" />
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="space-y-8">
            <span className="section-kicker">Honest online presence reviews</span>
            <div className="space-y-6">
              <h1 className="font-heading text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                See what is working, what is missing, and what deserves attention
                <span className="text-gradient-brand"> without the hype.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Virtura Presence helps small businesses understand how they are found,
                trusted, and contacted online through a polished first-pass check and a
                consultant-ready review workflow.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/presence-check">
                  Start Free Presence Check
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link href="#service-plans">View Service Plans</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                "Helpful first-pass review",
                "Manual audit when deeper work is needed",
                "Built for honest consultant delivery",
              ].map((item) => (
                <div key={item} className="surface-card px-5 py-4 text-sm leading-6 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <ScorePanel
              score={demoAssessment.score}
              tier={demoAssessment.tier}
              summary={demoAssessment.summary}
              encouragement={demoAssessment.encouragement}
              strengths={demoAssessment.strengths.slice(0, 2)}
              improvements={demoAssessment.improvements.slice(0, 2)}
              categories={demoAssessment.categories}
            />
            <div className="surface-card grid gap-4 p-6 sm:grid-cols-3">
              {[
                { icon: CircleCheckBig, label: "Constructive scoring" },
                { icon: Bot, label: "AI-assisted drafting" },
                { icon: MapPinned, label: "Local presence aware" },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="rounded-3xl border border-slate-200/70 bg-white/90 p-4">
                    <Icon className="size-5 text-brand-600" />
                    <p className="mt-3 text-sm font-medium text-slate-800">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="philosophy" className="section-shell">
        <SectionHeading
          eyebrow="Core philosophy"
          title="A presence review should build confidence, not manufacture fear."
          description="Virtura Presence is designed around clarity, honesty, and calm practical advice. When a business is doing well, the product should say so. When something is weak, it should be direct without becoming pushy."
          align="center"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {philosophy.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="surface-card p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 font-heading text-2xl font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="section-shell">
        <SectionHeading
          eyebrow="How it works"
          title="A polished, guided experience on the front end. A refined consultant workspace behind it."
          description="The public flow stays conversational and focused, while the internal side supports review, drafting, publishing, and follow-up without pretending to be a bloated CRM."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="surface-card p-6">
              <div className="inline-flex rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-brand-700 uppercase">
                Step {index + 1}
              </div>
              <h3 className="mt-5 font-heading text-2xl font-semibold text-slate-950">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Common gaps"
          title="Weak presence rarely looks dramatic. It usually looks quietly inconsistent."
          description="Businesses often do a lot right offline and still lose confidence online because key proof points are incomplete, stale, or uneven across channels."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {commonGaps.map((gap) => (
            <article key={gap} className="surface-card p-6">
              <p className="text-base leading-8 text-slate-700">{gap}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="service-plans" className="section-shell">
        <SectionHeading
          eyebrow="Service plans"
          title="Recommendations are available when they are actually justified."
          description="Virtura Presence supports plan recommendations such as profile cleanup, website launch support, ongoing visibility care, and deeper manual audits. Starting prices are visible because fit should be clear, not hidden."
        />
        <div className="mt-10 grid gap-5 xl:grid-cols-2">
          {servicePlans.map((plan) => (
            <ServicePlanCard key={plan.slug} plan={plan} />
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Testimonials"
          title="Designed for trust-forward delivery."
          description="This section is ready for real client proof once Virtura Presence starts publishing production reviews and plan recommendations."
          align="center"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {[
            "Placeholder for a future client quote about getting a calm, useful review instead of pressure tactics.",
            "Placeholder for a future client quote about understanding exactly what to fix and what not to overpay for.",
          ].map((quote) => (
            <article key={quote} className="surface-card p-6">
              <MessageSquareQuote className="size-6 text-brand-600" />
              <p className="mt-4 text-base leading-8 text-slate-700">{quote}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="section-shell">
        <SectionHeading
          eyebrow="FAQ"
          title="Clear expectations from the start."
          description="The product is designed to help businesses make better decisions, not to trap them in marketing theater."
        />
        <div className="mt-10 grid gap-5">
          {faqs.map((faq) => (
            <article key={faq.question} className="surface-card p-6">
              <h3 className="font-heading text-xl font-semibold text-slate-950">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="surface-card overflow-hidden p-8 sm:p-10">
          <div className="hero-orb right-10 top-10 h-40 w-40 opacity-60" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="section-kicker">Ready to start?</span>
              <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-slate-950">
                Start the free presence check and get a grounded first-pass review.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                See how your business currently shows up, where confidence is already
                strong, and where a manual consultant review would actually help.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/presence-check">
                Start Free Presence Check
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
