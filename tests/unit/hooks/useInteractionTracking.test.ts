import { renderHook, act, waitFor } from '@testing-library/react';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
import { describe, it, expect, beforeEach, vi } from 'vitest';
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

describe('useInteractionTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
    );
  });

  it('tracks interaction when userId is provided', async () => {
    const { result } = renderHook(() => useInteractionTracking('user-123'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.trackInteraction('/home', 'click', 'hero-button');
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/interactions'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('does not track when userId is undefined', () => {
    const { result } = renderHook(() => useInteractionTracking(undefined), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.trackInteraction('/home', 'click', 'hero-button');
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('tracks page visit with duration', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useInteractionTracking('user-123'), {
      wrapper: createWrapper(),
    });

    let cleanup: () => void;
    act(() => {
      cleanup = result.current.trackPageVisit('/dashboard');
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/interactions'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('visit'),
        })
      );
    });

    // Advance time by 5 seconds
    vi.advanceTimersByTime(5000);

    act(() => {
      cleanup!();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/interactions'),
        expect.objectContaining({
          body: expect.stringContaining('exit'),
        })
      );
    });

    vi.useRealTimers();
  });

  it('includes metadata in tracking', async () => {
    const { result } = renderHook(() => useInteractionTracking('user-123'), {
      wrapper: createWrapper(),
    });

    const metadata = { scrollDepth: 75, videoPlayed: true };

    act(() => {
      result.current.trackInteraction('/home', 'scroll', 'content', 10, metadata);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/interactions'),
        expect.objectContaining({
          body: expect.stringContaining(JSON.stringify(metadata)),
        })
      );
    });
  });

  it('returns no-op cleanup when userId is undefined', () => {
    const { result } = renderHook(() => useInteractionTracking(undefined), {
      wrapper: createWrapper(),
    });

    const cleanup = result.current.trackPageVisit('/home');
    expect(cleanup).toBeInstanceOf(Function);

    // Should not throw
    act(() => {
      cleanup();
    });

    expect(fetch).not.toHaveBeenCalled();
  });
});
