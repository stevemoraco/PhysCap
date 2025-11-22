import { renderHook, act } from '@testing-library/react';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useDevicePerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects desktop as high quality', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1920 });
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    });

    const { result } = renderHook(() => useDevicePerformance());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isLowEnd).toBe(false);
    expect(result.current.quality).toBe('high');
    expect(result.current.targetFPS).toBe(60);
    expect(result.current.shadowsEnabled).toBe(true);
    expect(result.current.antialiasEnabled).toBe(true);
  });

  it('detects mobile device as medium quality', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 390 });
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });

    const { result } = renderHook(() => useDevicePerformance());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.quality).toBe('medium');
    expect(result.current.targetFPS).toBe(30);
    expect(result.current.shadowsEnabled).toBe(false);
  });

  it('detects low-end device', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 360 });
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone 6 OS 12_0 like Mac OS X)',
    });
    Object.defineProperty(navigator, 'deviceMemory', {
      writable: true,
      configurable: true,
      value: 2,
    });

    const { result } = renderHook(() => useDevicePerformance());

    expect(result.current.isLowEnd).toBe(true);
    expect(result.current.quality).toBe('low');
    expect(result.current.targetFPS).toBe(24);
    expect(result.current.maxParticles).toBe(15);
    expect(result.current.antialiasEnabled).toBe(false);
  });

  it('limits pixel ratio on mobile', () => {
    Object.defineProperty(window, 'devicePixelRatio', { writable: true, value: 3 });
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 390 });
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });

    const { result } = renderHook(() => useDevicePerformance());

    expect(result.current.pixelRatio).toBeLessThanOrEqual(1.5);
  });

  it('sets appropriate particle counts', () => {
    const testCases = [
      { isLowEnd: true, expected: 15 },
      { isMobile: true, expected: 25 },
      { isDesktop: true, expected: 40 },
    ];

    testCases.forEach(testCase => {
      // Reset deviceMemory first
      if ('deviceMemory' in navigator) {
        delete (navigator as any).deviceMemory;
      }

      if (testCase.isLowEnd) {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: 360 });
        Object.defineProperty(navigator, 'userAgent', {
          writable: true,
          value: 'Mozilla/5.0 (iPhone; CPU iPhone 6 OS 12_0 like Mac OS X)',
        });
        Object.defineProperty(navigator, 'deviceMemory', {
          writable: true,
          configurable: true,
          value: 2,
        });
      } else if (testCase.isMobile) {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: 390 });
        Object.defineProperty(navigator, 'userAgent', {
          writable: true,
          value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        });
        // Ensure deviceMemory is high enough to not be considered low-end
        Object.defineProperty(navigator, 'deviceMemory', {
          writable: true,
          configurable: true,
          value: 4,
        });
      } else {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: 1920 });
        Object.defineProperty(navigator, 'userAgent', {
          writable: true,
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        });
        Object.defineProperty(navigator, 'deviceMemory', {
          writable: true,
          configurable: true,
          value: 8,
        });
      }

      const { result } = renderHook(() => useDevicePerformance());
      expect(result.current.maxParticles).toBe(testCase.expected);
    });
  });
});
