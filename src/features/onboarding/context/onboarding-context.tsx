import { createContext, type ReactNode, useContext, useState } from "react";

interface OnboardingProfileData {
  name?: string;
  company?: string;
  job_title?: string;
  country?: string;
  phone?: string;
  bio?: string;
  website?: string;
  image?: File | string | null; // Profile image (File for upload, string for URL)
}

interface OnboardingOrganizationData {
  name?: string;
  slug?: string;
  description?: string;
  logo?: File | string | null; // Organization logo (File for upload, string for URL)
}

interface OnboardingContextType {
  profile: OnboardingProfileData;
  organization: OnboardingOrganizationData;
  updateProfile: (data: Partial<OnboardingProfileData>) => void;
  updateOrganization: (data: Partial<OnboardingOrganizationData>) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<OnboardingProfileData>({});
  const [organization, setOrganization] = useState<OnboardingOrganizationData>(
    {}
  );

  const updateProfile = (data: Partial<OnboardingProfileData>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  const updateOrganization = (data: Partial<OnboardingOrganizationData>) => {
    setOrganization((prev) => ({ ...prev, ...data }));
  };

  const reset = () => {
    setProfile({});
    setOrganization({});
  };

  return (
    <OnboardingContext.Provider
      value={{
        profile,
        organization,
        updateProfile,
        updateOrganization,
        reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
