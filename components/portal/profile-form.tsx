"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AdvertisingCadence, ReviewRequestCadence } from "@prisma/client";
import { toast } from "sonner";

import { updatePortalProfileAction } from "@/lib/actions/portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PortalProfileFormProps = {
  businessId: string;
  defaultValues: {
    accountName: string;
    businessName: string;
    ownerName: string;
    businessCategory: string;
    city: string;
    state: string;
    serviceArea: string;
    contactEmail: string;
    phone: string;
    websiteUrl: string;
    googleBusinessProfileUrl: string;
    facebookUrl: string;
    instagramUrl: string;
    linkedinUrl: string;
    youtubeUrl: string;
    nextdoorUrl: string;
    businessDescription: string;
    reviewCount: string;
    averageRating: string;
    reviewRequestCadence: ReviewRequestCadence;
    runsAdvertising: AdvertisingCadence;
    goalsText: string;
  };
};

export function PortalProfileForm({
  businessId,
  defaultValues,
}: PortalProfileFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(defaultValues);
  const [isPending, startTransition] = useTransition();

  function updateValue(field: keyof typeof values, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const response = await updatePortalProfileAction({
        businessId,
        accountName: values.accountName,
        businessName: values.businessName,
        ownerName: values.ownerName,
        businessCategory: values.businessCategory,
        city: values.city,
        state: values.state,
        serviceArea: values.serviceArea,
        contactEmail: values.contactEmail,
        phone: values.phone,
        websiteUrl: values.websiteUrl,
        googleBusinessProfileUrl: values.googleBusinessProfileUrl,
        facebookUrl: values.facebookUrl,
        instagramUrl: values.instagramUrl,
        linkedinUrl: values.linkedinUrl,
        youtubeUrl: values.youtubeUrl,
        nextdoorUrl: values.nextdoorUrl,
        businessDescription: values.businessDescription,
        reviewCount: values.reviewCount ? Number(values.reviewCount) : undefined,
        averageRating: values.averageRating ? Number(values.averageRating) : undefined,
        reviewRequestCadence: values.reviewRequestCadence,
        runsAdvertising: values.runsAdvertising,
        goalsText: values.goalsText,
      });

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      toast.success("Business profile updated.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Company profile</p>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-950">
            Keep your business details current
          </h2>
        </div>
        <Button type="submit" className="rounded-full px-5" disabled={isPending}>
          {isPending ? "Saving..." : "Save profile"}
        </Button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your name">
              <Input
                value={values.accountName}
                onChange={(event) => updateValue("accountName", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
            <Field label="Business name">
              <Input
                value={values.businessName}
                onChange={(event) => updateValue("businessName", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
            <Field label="Owner / contact name">
              <Input
                value={values.ownerName}
                onChange={(event) => updateValue("ownerName", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
            <Field label="Business category">
              <Input
                value={values.businessCategory}
                onChange={(event) => updateValue("businessCategory", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
            <Field label="City">
              <Input
                value={values.city}
                onChange={(event) => updateValue("city", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
            <Field label="State">
              <Input
                value={values.state}
                onChange={(event) => updateValue("state", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
          </div>

          <Field label="Primary service area">
            <Input
              value={values.serviceArea}
              onChange={(event) => updateValue("serviceArea", event.target.value)}
              className="h-12 rounded-2xl"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Contact email">
              <Input
                type="email"
                value={values.contactEmail}
                onChange={(event) => updateValue("contactEmail", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
            <Field label="Phone">
              <Input
                value={values.phone}
                onChange={(event) => updateValue("phone", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
          </div>

          <div className="grid gap-5">
            <Field label="Website">
              <Input
                value={values.websiteUrl}
                onChange={(event) => updateValue("websiteUrl", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
            <Field label="Google Business Profile">
              <Input
                value={values.googleBusinessProfileUrl}
                onChange={(event) =>
                  updateValue("googleBusinessProfileUrl", event.target.value)
                }
                className="h-12 rounded-2xl"
              />
            </Field>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Facebook">
              <Input
                value={values.facebookUrl}
                onChange={(event) => updateValue("facebookUrl", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
            <Field label="Instagram">
              <Input
                value={values.instagramUrl}
                onChange={(event) => updateValue("instagramUrl", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
            <Field label="LinkedIn">
              <Input
                value={values.linkedinUrl}
                onChange={(event) => updateValue("linkedinUrl", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
            <Field label="YouTube">
              <Input
                value={values.youtubeUrl}
                onChange={(event) => updateValue("youtubeUrl", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
          </div>

          <Field label="Nextdoor">
            <Input
              value={values.nextdoorUrl}
              onChange={(event) => updateValue("nextdoorUrl", event.target.value)}
              className="h-12 rounded-2xl"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Current review count">
              <Input
                type="number"
                min={0}
                value={values.reviewCount}
                onChange={(event) => updateValue("reviewCount", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
            <Field label="Average rating">
              <Input
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={values.averageRating}
                onChange={(event) => updateValue("averageRating", event.target.value)}
                className="h-12 rounded-2xl"
              />
            </Field>
            <Field label="Review request process">
              <select
                value={values.reviewRequestCadence}
                onChange={(event) =>
                  updateValue(
                    "reviewRequestCadence",
                    event.target.value as ReviewRequestCadence,
                  )
                }
                className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
              >
                <option value="NEVER">Never ask</option>
                <option value="RARELY">Rarely ask</option>
                <option value="SOMETIMES">Sometimes ask</option>
                <option value="REGULARLY">Regularly ask</option>
              </select>
            </Field>
            <Field label="Advertising">
              <select
                value={values.runsAdvertising}
                onChange={(event) =>
                  updateValue(
                    "runsAdvertising",
                    event.target.value as AdvertisingCadence,
                  )
                }
                className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
              >
                <option value="NO">No</option>
                <option value="OCCASIONALLY">Occasionally</option>
                <option value="YES">Yes</option>
              </select>
            </Field>
          </div>

          <Field label="Business description or notes">
            <Textarea
              rows={5}
              value={values.businessDescription}
              onChange={(event) => updateValue("businessDescription", event.target.value)}
              className="rounded-3xl"
            />
          </Field>

          <Field label="Major goals">
            <Textarea
              rows={4}
              value={values.goalsText}
              onChange={(event) => updateValue("goalsText", event.target.value)}
              className="rounded-3xl"
              placeholder="One goal per line"
            />
          </Field>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
