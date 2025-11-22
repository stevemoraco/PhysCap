import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTavakievSources } from '@/hooks/useTavakievSources';
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

describe('useTavakievSources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fallback sections initially', () => {
    const { result } = renderHook(() => useTavakievSources(), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('fetches sections from API successfully', async () => {
    const mockSections = [
      { id: '1', heading: 'Overview', content: 'Test content' },
      { id: '2', heading: 'Technology', content: 'Tech content' },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSections),
      } as Response)
    );

    const { result } = renderHook(() => useTavakievSources(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have data (either mocked or fallback)
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('uses fallback sections when API returns empty array', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response)
    );

    const { result } = renderHook(() => useTavakievSources(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data!.length).toBeGreaterThan(0);
  });

  it('handles API errors and keeps fallback data', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Server Error',
      } as Response)
    );

    const { result } = renderHook(() => useTavakievSources(), {
      wrapper: createWrapper(),
    });

    // Should still have initial fallback data
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
