import { notFound } from "next/navigation";

import { ChangePasswordForm } from "@/components/portal/change-password-form";
import { PortalProfileForm } from "@/components/portal/profile-form";
import { getCurrentUser } from "@/lib/auth";
import { getPortalProfileData } from "@/lib/data/portal";
import { asStringArray } from "@/lib/text";

export default async function PortalProfilePage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return null;
  }

  const profile = await getPortalProfileData(user.id);

  if (!profile?.business) {
    notFound();
  }

  const socialLinks =
    profile.business.socialLinks && typeof profile.business.socialLinks === "object"
      ? (profile.business.socialLinks as Record<string, string | null | undefined>)
      : {};

  return (
    <div className="space-y-6">
      <PortalProfileForm
        businessId={profile.business.id}
        defaultValues={{
          accountName: profile.user.name ?? "",
          businessName: profile.business.name,
          ownerName: profile.business.ownerName ?? profile.user.name ?? "",
          businessCategory: profile.business.businessCategory,
          city: profile.business.city,
          state: profile.business.state,
          serviceArea: profile.business.serviceArea ?? "",
          contactEmail: profile.business.primaryEmail,
          phone: profile.business.primaryPhone ?? profile.user.phone ?? "",
          websiteUrl: profile.business.websiteUrl ?? "",
          googleBusinessProfileUrl: profile.business.googleBusinessProfileUrl ?? "",
          facebookUrl: socialLinks.facebook ?? "",
          instagramUrl: socialLinks.instagram ?? "",
          linkedinUrl: socialLinks.linkedin ?? "",
          youtubeUrl: socialLinks.youtube ?? "",
          nextdoorUrl: socialLinks.nextdoor ?? "",
          businessDescription: profile.business.description ?? "",
          reviewCount: profile.business.reviewCount?.toString() ?? "",
          averageRating: profile.business.averageRating?.toString() ?? "",
          reviewRequestCadence: profile.business.reviewRequestCadence ?? "NEVER",
          runsAdvertising: profile.business.runsAdvertising ?? "NO",
          goalsText: asStringArray(profile.business.goals).join("\n"),
        }}
      />

      <ChangePasswordForm />
    </div>
  );
}
