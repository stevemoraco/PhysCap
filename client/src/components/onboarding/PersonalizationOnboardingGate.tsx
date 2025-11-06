import { useAuth } from "@/hooks/useAuth";
import { usePersonalization } from "@/hooks/usePersonalization";
import { ProfileOnboardingModal } from "@/components/onboarding/ProfileOnboardingModal";
export function PersonalizationOnboardingGate() {
  const { user } = useAuth();
  const { showOnboarding, setShowOnboarding, profile } = usePersonalization();

  if (!user) {
    return null;
  }

  return (
    <ProfileOnboardingModal
      isOpen={showOnboarding}
      onClose={() => setShowOnboarding(false)}
      userId={user.id}
      initialData={{
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        company: user.company ?? "",
        profession: user.profession ?? "",
        expertiseTags: profile?.expertiseTags ?? [],
        investmentGoals: profile?.investmentGoals ?? [],
        preferredInvestmentRange: profile?.preferredInvestmentRange ?? "",
        riskAppetite: profile?.riskAppetite ?? "5",
      }}
    />
  );
}
