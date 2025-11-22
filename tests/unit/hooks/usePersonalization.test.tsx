import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePersonalization, PersonalizationProvider } from '@/contexts/PersonalizationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/hooks/useAuth';

const createWrapper = (mockUser: any = null) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // Mock useAuth implementation
  vi.mocked(useAuth).mockReturnValue({
    user: mockUser,
    isLoading: false,
    isAuthenticated: !!mockUser,
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <PersonalizationProvider>{children}</PersonalizationProvider>
    </QueryClientProvider>
  );
};

describe('usePersonalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => usePersonalization());
    }).toThrow('usePersonalization must be used within a PersonalizationProvider');

    consoleSpy.mockRestore();
  });

  it('returns default state when no user is logged in', () => {
    const { result } = renderHook(() => usePersonalization(), {
      wrapper: createWrapper(null),
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.personalizedCopy).toEqual({});
    expect(result.current.isLoading).toBe(false);
    expect(result.current.showOnboarding).toBe(false);
    expect(typeof result.current.getPersonalizedText).toBe('function');
    expect(typeof result.current.setShowOnboarding).toBe('function');
  });

  it('fetches profile when user is logged in', async () => {
    const mockUser = { id: 123, username: 'testuser' };
    const mockProfile = {
      id: 123,
      username: 'testuser',
      email: 'test@example.com',
      persona: 'tech_investor',
      industryFocus: ['renewable_energy'],
    };

    global.fetch = vi.fn((url) => {
      if (typeof url === 'string' && url.includes('/api/users/profile/123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfile),
        } as Response);
      }
      return Promise.resolve({
        ok: false,
        status: 404,
      } as Response);
    });

    const { result } = renderHook(() => usePersonalization(), {
      wrapper: createWrapper(mockUser),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
  });

  it('shows onboarding when user exists but has no profile', async () => {
    const mockUser = { id: 456, username: 'newuser' };

    global.fetch = vi.fn((url) => {
      if (typeof url === 'string' && url.includes('/api/users/profile/456')) {
        return Promise.resolve({
          ok: false,
          status: 404,
        } as Response);
      }
      return Promise.resolve({
        ok: false,
        status: 404,
      } as Response);
    });

    const { result } = renderHook(() => usePersonalization(), {
      wrapper: createWrapper(mockUser),
    });

    await waitFor(() => {
      expect(result.current.showOnboarding).toBe(true);
    });
  });

  it('fetches personalized copy when user has profile', async () => {
    const mockUser = { id: 789, username: 'investor' };
    const mockProfile = {
      id: 789,
      username: 'investor',
      email: 'investor@example.com',
      persona: 'institutional_investor',
    };
    const mockCopy = {
      hero_title: 'Welcome, Institutional Investor',
      cta_text: 'Review Investment Opportunities',
    };

    global.fetch = vi.fn((url) => {
      if (typeof url === 'string' && url.includes('/api/users/profile/789')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfile),
        } as Response);
      }
      if (typeof url === 'string' && url.includes('/api/personalization/copy/789')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCopy),
        } as Response);
      }
      return Promise.resolve({
        ok: false,
        status: 404,
      } as Response);
    });

    const { result } = renderHook(() => usePersonalization(), {
      wrapper: createWrapper(mockUser),
    });

    await waitFor(() => {
      expect(result.current.personalizedCopy).toEqual(mockCopy);
    });
  });

  it('getPersonalizedText returns custom copy when available', async () => {
    const mockUser = { id: 999, username: 'customuser' };
    const mockProfile = { id: 999, username: 'customuser' };
    const mockCopy = {
      greeting: 'Hello, valued partner',
    };

    global.fetch = vi.fn((url) => {
      if (typeof url === 'string' && url.includes('/api/users/profile/999')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfile),
        } as Response);
      }
      if (typeof url === 'string' && url.includes('/api/personalization/copy/999')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCopy),
        } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    });

    const { result } = renderHook(() => usePersonalization(), {
      wrapper: createWrapper(mockUser),
    });

    await waitFor(() => {
      expect(result.current.personalizedCopy).toEqual(mockCopy);
    });

    expect(result.current.getPersonalizedText('greeting', 'Hello')).toBe('Hello, valued partner');
  });

  it('getPersonalizedText returns default text when key not found', () => {
    const { result } = renderHook(() => usePersonalization(), {
      wrapper: createWrapper(null),
    });

    expect(result.current.getPersonalizedText('missing_key', 'Default Text')).toBe('Default Text');
  });

  it('handles profile fetch errors gracefully', async () => {
    const mockUser = { id: 111, username: 'erroruser' };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      } as Response)
    );

    const { result } = renderHook(() => usePersonalization(), {
      wrapper: createWrapper(mockUser),
    });

    // Should not crash and should have default values
    expect(result.current.profile).toBeDefined();
    expect(result.current.personalizedCopy).toEqual({});
  });
});
