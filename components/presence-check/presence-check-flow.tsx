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
  presenceCheckDefaultValues,
  presenceCheckSchema,
  socialPlatformOptions,
  type PresenceCheckInput,
} from "@/lib/validations/presence-check";

const storageKey = "virtura-presence-preview";

const steps = [
  {
    title: "Business basics",
    description: "Start with who you are and who should receive the report preview.",
    fields: ["businessName", "ownerName", "email", "phone"] as const,
  },
  {
    title: "Business context",
    description: "Give enough context for the review to stay grounded in your real market.",
    fields: ["businessCategory", "city", "state", "serviceArea", "goals"] as const,
  },
  {
    title: "Website and local presence",
    description: "Tell us about the channels customers are most likely to check first.",
    fields: [
      "hasWebsite",
      "websiteUrl",
      "usesGoogleBusinessProfile",
      "googleBusinessProfileUrl",
    ] as const,
  },
  {
    title: "Discovery and trust signals",
    description: "Show how customers currently find you and what proof they see.",
    fields: [
      "socialPlatforms",
      "runsAdvertising",
      "discoveryChannels",
      "collectsReviews",
    ] as const,
  },
  {
    title: "Final notes",
    description: "Add anything a consultant should know before reviewing the quick score.",
    fields: ["notes"] as const,
  },
];

type ToggleField = "socialPlatforms" | "discoveryChannels" | "goals";

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

  function renderError(field: keyof PresenceCheckInput) {
    const message = form.formState.errors[field]?.message;

    if (typeof message !== "string") {
      return null;
    }

    return <p className="text-sm text-rose-600">{message}</p>;
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

      toast.success("Presence check saved. Your quick review is ready.");
      router.push("/presence-check/results");
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <div className="surface-card p-6 sm:p-8">
          <span className="section-kicker">Guided onboarding</span>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
            A polished first-pass review, built to stay grounded.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This is not a fake report card. The goal is to understand how your
            business currently shows up online and where the clearest next wins
            are likely to be.
          </p>
          <div className="mt-8 space-y-4">
            {[
              "Takes just a few minutes to complete",
              "Focuses on what customers can actually see",
              "Feeds into a deeper consultant review when needed",
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
              Once you submit, Virtura Presence will generate an encouraging quick
              summary and preserve the answers so the deeper manual audit can stay
              aligned with what matters to your business.
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
                  <Label htmlFor="ownerName">Owner name</Label>
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
                  <Label htmlFor="serviceArea">Service area</Label>
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
                  <Label>Do you have a website?</Label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Yes", value: "yes" },
                      { label: "No", value: "no" },
                      { label: "In progress", value: "in-progress" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          form.setValue("hasWebsite", option.value as PresenceCheckInput["hasWebsite"], {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                        }
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm transition-all duration-200",
                          values.hasWebsite === option.value
                            ? "border-brand-300 bg-brand-50 text-brand-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-slate-900",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {values.hasWebsite === "yes" ? (
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
                  <Label>Do you use Google Business Profile?</Label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Yes", value: "yes" },
                      { label: "No", value: "no" },
                      { label: "Not sure", value: "not-sure" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          form.setValue(
                            "usesGoogleBusinessProfile",
                            option.value as PresenceCheckInput["usesGoogleBusinessProfile"],
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            },
                          )
                        }
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm transition-all duration-200",
                          values.usesGoogleBusinessProfile === option.value
                            ? "border-brand-300 bg-brand-50 text-brand-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-slate-900",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {values.usesGoogleBusinessProfile === "yes" ? (
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
                  <Label>Which social platforms do you use?</Label>
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
                </div>

                <div className="space-y-3">
                  <Label>Do you run advertising?</Label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Yes", value: "yes" },
                      { label: "Occasionally", value: "occasionally" },
                      { label: "No", value: "no" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          form.setValue(
                            "runsAdvertising",
                            option.value as PresenceCheckInput["runsAdvertising"],
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            },
                          )
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

                <div className="space-y-3">
                  <Label>Do you actively collect reviews?</Label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Yes", value: "yes" },
                      { label: "Somewhat", value: "somewhat" },
                      { label: "Not yet", value: "not-yet" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          form.setValue(
                            "collectsReviews",
                            option.value as PresenceCheckInput["collectsReviews"],
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            },
                          )
                        }
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm transition-all duration-200",
                          values.collectsReviews === option.value
                            ? "border-brand-300 bg-brand-50 text-brand-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-slate-900",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
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
                      <p className="text-xs text-slate-500">Report destination</p>
                      <p className="mt-1 font-medium text-slate-900">{values.email}</p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3">
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {values.city}, {values.state}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3">
                      <p className="text-xs text-slate-500">Goals</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {values.goals.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="notes">Anything else we should know?</Label>
                  <Textarea
                    id="notes"
                    rows={6}
                    className="rounded-3xl"
                    placeholder="Optional context about your market, customers, current frustrations, or what you want the audit to focus on."
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
