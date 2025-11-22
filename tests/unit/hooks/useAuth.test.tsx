import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthenticated state initially', () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      } as Response)
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
  });

  it('provides authentication state structure', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Check the hook returns expected structure
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(typeof result.current.isLoading).toBe('boolean');
    expect(typeof result.current.isAuthenticated).toBe('boolean');
  });

  it('handles authentication errors gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server error'),
      } as Response)
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
  });
});
