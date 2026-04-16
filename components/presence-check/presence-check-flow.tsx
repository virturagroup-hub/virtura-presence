"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { submitPresenceCheckAction } from "@/lib/actions/presence-check";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  discoveryChannelOptions,
  goalOptions,
  googleBusinessProfileStatusOptions,
  presenceCheckDefaultValues,
  presenceCheckSchema,
  reviewRequestCadenceOptions,
  reviewStrengthOptions,
  socialPlatformOptions,
  socialPresenceLevelOptions,
  websiteStatusOptions,
  type PresenceCheckInput,
} from "@/lib/validations/presence-check";

const storageKey = "virtura-presence-preview";

const steps = [
  {
    title: "Business basics",
    description: "Start with who you are and where the free report should go once you choose to send it.",
    fields: ["businessName", "ownerName", "email", "phone"] as const,
  },
  {
    title: "Business context",
    description: "Give enough market context for the score to stay grounded in your real service area and goals.",
    fields: ["businessCategory", "city", "state", "serviceArea", "goals"] as const,
  },
  {
    title: "Website and local presence",
    description: "Be specific about how complete the public-facing foundation actually is today.",
    fields: [
      "websiteStatus",
      "websiteUrl",
      "googleBusinessProfileStatus",
      "googleBusinessProfileUrl",
    ] as const,
  },
  {
    title: "Trust and activity",
    description: "Describe reviews, social activity, and how customers usually discover the business.",
    fields: [
      "reviewStrength",
      "reviewRequestCadence",
      "reviewCount",
      "averageRating",
      "socialPresenceLevel",
      "socialPlatforms",
      "runsAdvertising",
      "discoveryChannels",
    ] as const,
  },
  {
    title: "Final notes",
    description: "Review the basics and add any nuance a consultant should know before a deeper audit.",
    fields: ["notes"] as const,
  },
] as const;

type ToggleField = "socialPlatforms" | "discoveryChannels" | "goals";

const websiteLabels: Record<PresenceCheckInput["websiteStatus"], string> = {
  none: "No website",
  "in-progress": "In progress, not live yet",
  basic: "Live but basic",
  "mostly-complete": "Live and mostly complete",
  polished: "Live and polished / updated",
};

const googleLabels: Record<PresenceCheckInput["googleBusinessProfileStatus"], string> = {
  none: "No profile",
  "not-sure": "Not sure",
  "claimed-incomplete": "Claimed but incomplete",
  "claimed-mostly-complete": "Claimed and mostly complete",
  active: "Claimed and actively maintained",
};

const reviewStrengthLabels: Record<PresenceCheckInput["reviewStrength"], string> = {
  none: "No reviews",
  few: "A few reviews",
  some: "Some reviews",
  strong: "Strong review base",
};

const reviewCadenceLabels: Record<PresenceCheckInput["reviewRequestCadence"], string> = {
  never: "Never ask",
  rarely: "Rarely ask",
  sometimes: "Sometimes ask",
  regularly: "Regularly ask",
};

const socialPresenceLabels: Record<PresenceCheckInput["socialPresenceLevel"], string> = {
  none: "None",
  "one-occasional": "One channel, occasional use",
  "one-active": "One channel, active use",
  "multiple-active": "Multiple active channels",
};

export function PresenceCheckFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PresenceCheckInput>({
    resolver: zodResolver(presenceCheckSchema),
    defaultValues: presenceCheckDefaultValues,
    mode: "onTouched",
  });

  const values = useWatch({
    control: form.control,
    defaultValue: presenceCheckDefaultValues,
  }) as PresenceCheckInput;
  const activeStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const showWebsiteUrl = ["basic", "mostly-complete", "polished"].includes(values.websiteStatus);
  const showGoogleUrl = ["claimed-incomplete", "claimed-mostly-complete", "active"].includes(
    values.googleBusinessProfileStatus,
  );

  function renderError(field: keyof PresenceCheckInput) {
    const message = form.formState.errors[field]?.message;

    if (typeof message !== "string") {
      return null;
    }

    return <p className="text-sm text-rose-600">{message}</p>;
  }

  function renderChoiceGroup<Value extends string>(
    options: readonly Value[],
    activeValue: Value,
    onSelect: (value: Value) => void,
    labels: Record<Value, string>,
  ) {
    return (
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              "rounded-[22px] border px-4 py-3 text-left text-sm transition-all duration-200",
              activeValue === option
                ? "border-brand-300 bg-brand-50 text-brand-700 shadow-[0_16px_35px_-28px_rgba(47,111,228,0.75)]"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-slate-900",
            )}
          >
            {labels[option]}
          </button>
        ))}
      </div>
    );
  }

  function toggleOption(field: ToggleField, value: string) {
    const current = form.getValues(field) as string[];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    form.setValue(field, next as PresenceCheckInput[ToggleField], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  async function handleNext() {
    const valid = await form.trigger(activeStep.fields);

    if (!valid) {
      return;
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function handleSubmit(valuesToSubmit: PresenceCheckInput) {
    startTransition(async () => {
      const response = await submitPresenceCheckAction(valuesToSubmit);

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          submittedAt: new Date().toISOString(),
          input: valuesToSubmit,
          reportEmail: valuesToSubmit.email,
          deliverySent: false,
          result: {
            score: response.result.score,
            tier: response.result.tierLabel,
            summary: response.result.summary,
            encouragement: response.result.encouragement,
            strengths: response.result.strengths,
            improvements: response.result.improvements,
            suggestedPlanSlugs: response.result.suggestedPlanSlugs,
            categories: response.result.categories,
          },
          submissionId: response.result.submissionId,
          nextStep: response.result.nextStep,
          claimToken: response.result.claimToken,
        }),
      );

      toast.success("Presence check saved. Review your quick score and choose where to send the free report.");
      router.push("/presence-check/results");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
      <div className="space-y-5">
        <div className="surface-card p-6 sm:p-8">
          <span className="section-kicker">Guided onboarding</span>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
            Honest inputs make the score more believable.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This check works best when the answers reflect the real state of the
            business today. Missing fundamentals should read like missing
            fundamentals, not polite middle-of-the-road placeholders.
          </p>
          <div className="mt-6 space-y-3">
            {[
              "Specific answer states instead of fuzzy yes or no inputs",
              "Constructive scoring that does not flatter weak foundations",
              "A cleaner handoff into the deeper consultant review when you request it",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200/70 bg-white/85 px-4 py-3 text-sm text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
            What happens next
          </p>
          <div className="mt-4 rounded-3xl border border-brand-100 bg-brand-50/70 p-4 text-sm leading-7 text-brand-800">
            <Sparkles className="size-4" />
            <p className="mt-3">
              Your quick score is generated immediately after submission, then you
              can choose where to send the free report and whether you want portal
              access or a deeper consultant-led review.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="surface-card overflow-hidden p-6 sm:p-8"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="section-kicker">
              Step {stepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 rounded-full bg-slate-100" />
          <div>
            <h2 className="font-heading text-3xl font-semibold text-slate-950">
              {activeStep.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {activeStep.description}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="mt-8 space-y-6"
          >
            {stepIndex === 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-3 sm:col-span-2">
                  <Label htmlFor="businessName">Business name</Label>
                  <Input id="businessName" className="h-12 rounded-2xl" {...form.register("businessName")} />
                  {renderError("businessName")}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="ownerName">Owner / contact name</Label>
                  <Input id="ownerName" className="h-12 rounded-2xl" {...form.register("ownerName")} />
                  {renderError("ownerName")}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" className="h-12 rounded-2xl" {...form.register("email")} />
                  {renderError("email")}
                </div>
                <div className="space-y-3 sm:col-span-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" className="h-12 rounded-2xl" {...form.register("phone")} />
                  {renderError("phone")}
                </div>
              </div>
            ) : null}

            {stepIndex === 1 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-3 sm:col-span-2">
                  <Label htmlFor="businessCategory">Business type or category</Label>
                  <Input
                    id="businessCategory"
                    className="h-12 rounded-2xl"
                    placeholder="Residential HVAC, family dental, personal training..."
                    {...form.register("businessCategory")}
                  />
                  {renderError("businessCategory")}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" className="h-12 rounded-2xl" {...form.register("city")} />
                  {renderError("city")}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" className="h-12 rounded-2xl" {...form.register("state")} />
                  {renderError("state")}
                </div>
                <div className="space-y-3 sm:col-span-2">
                  <Label htmlFor="serviceArea">City / service area</Label>
                  <Input
                    id="serviceArea"
                    className="h-12 rounded-2xl"
                    placeholder="Neighborhoods, metro area, counties, or regions"
                    {...form.register("serviceArea")}
                  />
                  {renderError("serviceArea")}
                </div>
                <div className="space-y-3 sm:col-span-2">
                  <Label>What do you want more of?</Label>
                  <div className="flex flex-wrap gap-3">
                    {goalOptions.map((option) => {
                      const active = values.goals.includes(option);

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleOption("goals", option)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm transition-all duration-200",
                            active
                              ? "border-brand-300 bg-brand-50 text-brand-700 shadow-[0_12px_30px_-20px_rgba(47,111,228,0.75)]"
                              : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-slate-900",
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {renderError("goals")}
                </div>
              </div>
            ) : null}

            {stepIndex === 2 ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Website status</Label>
                  {renderChoiceGroup(
                    websiteStatusOptions,
                    values.websiteStatus,
                    (value) =>
                      form.setValue("websiteStatus", value, {
                        shouldDirty: true,
                        shouldTouch: true,
                            shouldValidate: true,
                          }),
                        websiteLabels,
                  )}
                </div>

                {showWebsiteUrl ? (
                  <div className="space-y-3">
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      className="h-12 rounded-2xl"
                      placeholder="https://www.yourbusiness.com"
                      {...form.register("websiteUrl")}
                    />
                    {renderError("websiteUrl")}
                  </div>
                ) : null}

                <div className="space-y-3">
                  <Label>Google Business Profile status</Label>
                  {renderChoiceGroup(
                    googleBusinessProfileStatusOptions,
                    values.googleBusinessProfileStatus,
                    (value) =>
                      form.setValue("googleBusinessProfileStatus", value, {
                        shouldDirty: true,
                        shouldTouch: true,
                            shouldValidate: true,
                          }),
                        googleLabels,
                  )}
                </div>

                {showGoogleUrl ? (
                  <div className="space-y-3">
                    <Label htmlFor="googleBusinessProfileUrl">Google Business Profile link</Label>
                    <Input
                      id="googleBusinessProfileUrl"
                      className="h-12 rounded-2xl"
                      placeholder="https://g.page/..."
                      {...form.register("googleBusinessProfileUrl")}
                    />
                    {renderError("googleBusinessProfileUrl")}
                  </div>
                ) : null}
              </div>
            ) : null}

            {stepIndex === 3 ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Review strength</Label>
                  {renderChoiceGroup(
                    reviewStrengthOptions,
                    values.reviewStrength,
                    (value) =>
                      form.setValue("reviewStrength", value, {
                        shouldDirty: true,
                        shouldTouch: true,
                            shouldValidate: true,
                          }),
                        reviewStrengthLabels,
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Review request process</Label>
                  {renderChoiceGroup(
                    reviewRequestCadenceOptions,
                    values.reviewRequestCadence,
                    (value) =>
                      form.setValue("reviewRequestCadence", value, {
                        shouldDirty: true,
                        shouldTouch: true,
                            shouldValidate: true,
                          }),
                        reviewCadenceLabels,
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="reviewCount">Current review count</Label>
                    <Input
                      id="reviewCount"
                      type="number"
                      min={0}
                      className="h-12 rounded-2xl"
                      {...form.register("reviewCount", {
                        setValueAs: (value) =>
                          value === "" || value === undefined ? undefined : Number(value),
                      })}
                    />
                    {renderError("reviewCount")}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="averageRating">Average rating</Label>
                    <Input
                      id="averageRating"
                      type="number"
                      step="0.1"
                      min={0}
                      max={5}
                      className="h-12 rounded-2xl"
                      {...form.register("averageRating", {
                        setValueAs: (value) =>
                          value === "" || value === undefined ? undefined : Number(value),
                      })}
                    />
                    {renderError("averageRating")}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Social presence</Label>
                  {renderChoiceGroup(
                    socialPresenceLevelOptions,
                    values.socialPresenceLevel,
                    (value) =>
                      form.setValue("socialPresenceLevel", value, {
                        shouldDirty: true,
                        shouldTouch: true,
                            shouldValidate: true,
                          }),
                        socialPresenceLabels,
                  )}
                  {renderError("socialPresenceLevel")}
                </div>

                <div className="space-y-3">
                  <Label>Which platforms are active enough to mention?</Label>
                  <div className="flex flex-wrap gap-3">
                    {socialPlatformOptions.map((option) => {
                      const active = values.socialPlatforms.includes(option);

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleOption("socialPlatforms", option)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm transition-all duration-200",
                            active
                              ? "border-brand-300 bg-brand-50 text-brand-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-slate-900",
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {renderError("socialPlatforms")}
                </div>

                <div className="space-y-3">
                  <Label>Do you run advertising?</Label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Yes", value: "yes" as const },
                      { label: "Occasionally", value: "occasionally" as const },
                      { label: "No", value: "no" as const },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          form.setValue("runsAdvertising", option.value, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                        }
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm transition-all duration-200",
                          values.runsAdvertising === option.value
                            ? "border-brand-300 bg-brand-50 text-brand-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-slate-900",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>How do customers usually find you?</Label>
                  <div className="flex flex-wrap gap-3">
                    {discoveryChannelOptions.map((option) => {
                      const active = values.discoveryChannels.includes(option);

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleOption("discoveryChannels", option)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm transition-all duration-200",
                            active
                              ? "border-brand-300 bg-brand-50 text-brand-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-slate-900",
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {renderError("discoveryChannels")}
                </div>
              </div>
            ) : null}

            {stepIndex === 4 ? (
              <div className="space-y-6">
                <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-5">
                  <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                    Quick review before scoring
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3">
                      <p className="text-xs text-slate-500">Business</p>
                      <p className="mt-1 font-medium text-slate-900">{values.businessName}</p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3">
                      <p className="text-xs text-slate-500">Free report destination</p>
                      <p className="mt-1 font-medium text-slate-900">{values.email}</p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3">
                      <p className="text-xs text-slate-500">Website</p>
                      <p className="mt-1 font-medium text-slate-900">{websiteLabels[values.websiteStatus]}</p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3">
                      <p className="text-xs text-slate-500">Google / local</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {googleLabels[values.googleBusinessProfileStatus]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="notes">Anything else we should know?</Label>
                  <Textarea
                    id="notes"
                    rows={5}
                    className="rounded-3xl"
                    placeholder="Optional context about your market, recent changes, current frustrations, or what you want a consultant to pay attention to."
                    {...form.register("notes")}
                  />
                  {renderError("notes")}
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
            disabled={stepIndex === 0}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          {stepIndex === steps.length - 1 ? (
            <Button type="submit" className="rounded-full px-6" disabled={isPending}>
              {isPending ? "Saving your presence check..." : "See my quick score"}
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="button" className="rounded-full px-6" onClick={handleNext}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
