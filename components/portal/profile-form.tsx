"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AdvertisingCadence, ReviewRequestCadence } from "@prisma/client";
import { toast } from "sonner";

import { updatePortalProfileAction } from "@/lib/actions/portal";
import { Button } from "@/components/ui/button";
import {
  WorkspaceField,
  WorkspaceInput,
  WorkspaceSection,
  WorkspaceSelect,
  WorkspaceTextarea,
} from "@/components/workspace/workspace-primitives";

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
    <form onSubmit={handleSubmit}>
      <WorkspaceSection
        kicker="Company profile"
        title="Keep your business details current"
        description="Update the business profile consultants and future reports rely on so the portal stays accurate over time."
        actions={
          <Button type="submit" className="rounded-full px-5" disabled={isPending}>
            {isPending ? "Saving..." : "Save profile"}
          </Button>
        }
      >
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your name">
              <WorkspaceInput
                value={values.accountName}
                onChange={(event) => updateValue("accountName", event.target.value)}
              />
            </Field>
            <Field label="Business name">
              <WorkspaceInput
                value={values.businessName}
                onChange={(event) => updateValue("businessName", event.target.value)}
              />
            </Field>
            <Field label="Owner / contact name">
              <WorkspaceInput
                value={values.ownerName}
                onChange={(event) => updateValue("ownerName", event.target.value)}
              />
            </Field>
            <Field label="Business category">
              <WorkspaceInput
                value={values.businessCategory}
                onChange={(event) => updateValue("businessCategory", event.target.value)}
              />
            </Field>
            <Field label="City">
              <WorkspaceInput
                value={values.city}
                onChange={(event) => updateValue("city", event.target.value)}
              />
            </Field>
            <Field label="State">
              <WorkspaceInput
                value={values.state}
                onChange={(event) => updateValue("state", event.target.value)}
              />
            </Field>
          </div>

          <Field label="Primary service area">
            <WorkspaceInput
              value={values.serviceArea}
              onChange={(event) => updateValue("serviceArea", event.target.value)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Contact email">
              <WorkspaceInput
                type="email"
                value={values.contactEmail}
                onChange={(event) => updateValue("contactEmail", event.target.value)}
              />
            </Field>
            <Field label="Phone">
              <WorkspaceInput
                value={values.phone}
                onChange={(event) => updateValue("phone", event.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-5">
            <Field label="Website">
              <WorkspaceInput
                value={values.websiteUrl}
                onChange={(event) => updateValue("websiteUrl", event.target.value)}
              />
            </Field>
            <Field label="Google Business Profile">
              <WorkspaceInput
                value={values.googleBusinessProfileUrl}
                onChange={(event) =>
                  updateValue("googleBusinessProfileUrl", event.target.value)
                }
              />
            </Field>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Facebook">
              <WorkspaceInput
                value={values.facebookUrl}
                onChange={(event) => updateValue("facebookUrl", event.target.value)}
              />
            </Field>
            <Field label="Instagram">
              <WorkspaceInput
                value={values.instagramUrl}
                onChange={(event) => updateValue("instagramUrl", event.target.value)}
              />
            </Field>
            <Field label="LinkedIn">
              <WorkspaceInput
                value={values.linkedinUrl}
                onChange={(event) => updateValue("linkedinUrl", event.target.value)}
              />
            </Field>
            <Field label="YouTube">
              <WorkspaceInput
                value={values.youtubeUrl}
                onChange={(event) => updateValue("youtubeUrl", event.target.value)}
              />
            </Field>
          </div>

          <Field label="Nextdoor">
            <WorkspaceInput
              value={values.nextdoorUrl}
              onChange={(event) => updateValue("nextdoorUrl", event.target.value)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Current review count">
              <WorkspaceInput
                type="number"
                min={0}
                value={values.reviewCount}
                onChange={(event) => updateValue("reviewCount", event.target.value)}
              />
            </Field>
            <Field label="Average rating">
              <WorkspaceInput
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={values.averageRating}
                onChange={(event) => updateValue("averageRating", event.target.value)}
              />
            </Field>
            <Field label="Review request process">
              <WorkspaceSelect
                value={values.reviewRequestCadence}
                onChange={(event) =>
                  updateValue(
                    "reviewRequestCadence",
                    event.target.value as ReviewRequestCadence,
                  )
                }
              >
                <option value="NEVER">Never ask</option>
                <option value="RARELY">Rarely ask</option>
                <option value="SOMETIMES">Sometimes ask</option>
                <option value="REGULARLY">Regularly ask</option>
              </WorkspaceSelect>
            </Field>
            <Field label="Advertising">
              <WorkspaceSelect
                value={values.runsAdvertising}
                onChange={(event) =>
                  updateValue(
                    "runsAdvertising",
                    event.target.value as AdvertisingCadence,
                  )
                }
              >
                <option value="NO">No</option>
                <option value="OCCASIONALLY">Occasionally</option>
                <option value="YES">Yes</option>
              </WorkspaceSelect>
            </Field>
          </div>

          <Field label="Business description or notes">
            <WorkspaceTextarea
              rows={5}
              value={values.businessDescription}
              onChange={(event) => updateValue("businessDescription", event.target.value)}
            />
          </Field>

          <Field label="Major goals">
            <WorkspaceTextarea
              rows={4}
              value={values.goalsText}
              onChange={(event) => updateValue("goalsText", event.target.value)}
              placeholder="One goal per line"
            />
          </Field>
        </div>
        </div>
      </WorkspaceSection>
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
  return <WorkspaceField label={label}>{children}</WorkspaceField>;
}
