import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile } from '@shared/schema';

interface PersonalizedCopy {
  [key: string]: string;
}

interface PersonalizationContextValue {
  profile: UserProfile | null;
  personalizedCopy: PersonalizedCopy;
  isLoading: boolean;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  getPersonalizedText: (key: string, defaultText: string) => string;
}

const PersonalizationContext = createContext<PersonalizationContextValue | undefined>(undefined);

interface PersonalizationProviderProps {
  children: ReactNode;
}

export function PersonalizationProvider({ children }: PersonalizationProviderProps) {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [personalizedCopy, setPersonalizedCopy] = useState<PersonalizedCopy>({});

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile | null>({
    queryKey: ['/api/users/profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/users/profile/${user.id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch profile');
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: copyData, isLoading: copyLoading } = useQuery<PersonalizedCopy>({
    queryKey: ['/api/personalization/copy', user?.id],
    queryFn: async () => {
      if (!user?.id || !profile) return {};
      const response = await fetch(`/api/personalization/copy/${user.id}`, {
        credentials: 'include',
      });
      if (!response.ok) return {};
      return response.json();
    },
    enabled: !!user?.id && !!profile,
  });

  useEffect(() => {
    if (copyData) {
      setPersonalizedCopy(copyData);
    }
  }, [copyData]);

  useEffect(() => {
    // Show onboarding if user is logged in but has no profile
    if (user && !profileLoading && !profile) {
      setShowOnboarding(true);
    }
  }, [user, profile, profileLoading]);

  useEffect(() => {
    if (!user) {
      setShowOnboarding(false);
    }
  }, [user]);

  const getPersonalizedText = (key: string, defaultText: string): string => {
    return personalizedCopy[key] || defaultText;
  };

  const isLoading = profileLoading || copyLoading;

  return (
    <PersonalizationContext.Provider
      value={{
        profile: profile ?? null,
        personalizedCopy,
        isLoading,
        showOnboarding,
        setShowOnboarding,
        getPersonalizedText,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}
