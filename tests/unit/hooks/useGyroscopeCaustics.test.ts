import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useGyroscopeCaustics,
  calculateLightDirection,
  interpolateLightDirection,
} from '@/hooks/useGyroscopeCaustics';

// Mock dependencies
vi.mock('@/hooks/useDeviceOrientation', () => ({
  useDeviceOrientation: vi.fn(),
}));

vi.mock('@/hooks/useDevicePerformance', () => ({
  useDevicePerformance: vi.fn(),
}));

import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

describe('useGyroscopeCaustics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDevicePerformance).mockReturnValue({
      quality: 'medium',
      maxParticles: 1000,
      enablePostProcessing: true,
      shadowQuality: 'medium',
    });
  });

  it('returns default state with gyroscope not supported', () => {
    vi.mocked(useDeviceOrientation).mockReturnValue({
      orientation: { alpha: null, beta: null, gamma: null },
      isSupported: false,
      error: null,
      requestPermission: vi.fn(),
    });

    const { result } = renderHook(() => useGyroscopeCaustics());

    expect(result.current.isGyroActive).toBe(false);
    expect(result.current.quality).toBe('medium');
    expect(result.current.causticsIntensity).toBeGreaterThan(0);
    expect(Array.isArray(result.current.lightDirection)).toBe(true);
    expect(result.current.lightDirection.length).toBe(3);
  });

  it('uses gyroscope data when available', async () => {
    vi.mocked(useDeviceOrientation).mockReturnValue({
      orientation: { alpha: 0, beta: 45, gamma: 30 },
      isSupported: true,
      error: null,
      requestPermission: vi.fn(),
    });

    const { result } = renderHook(() => useGyroscopeCaustics());

    await waitFor(() => {
      expect(result.current.isGyroActive).toBe(true);
    });

    expect(result.current.lightDirection).toBeDefined();
    expect(result.current.smoothedBeta).toBeDefined();
    expect(result.current.smoothedGamma).toBeDefined();
  });

  it('applies custom intensity option', async () => {
    vi.mocked(useDeviceOrientation).mockReturnValue({
      orientation: { alpha: 0, beta: 0, gamma: 0 },
      isSupported: true,
      error: null,
      requestPermission: vi.fn(),
    });

    const { result } = renderHook(() =>
      useGyroscopeCaustics({ intensity: 2.5, autoIntensity: false })
    );

    await waitFor(() => {
      expect(result.current.causticsIntensity).toBe(2.5);
    });
  });

  it('auto-adjusts intensity based on motion when enabled', async () => {
    const { result, rerender } = renderHook(
      ({ beta, gamma }) =>
        useGyroscopeCaustics({ intensity: 1.0, autoIntensity: true }),
      {
        initialProps: { beta: 0, gamma: 0 },
      }
    );

    // Start with no motion
    vi.mocked(useDeviceOrientation).mockReturnValue({
      orientation: { alpha: 0, beta: 0, gamma: 0 },
      isSupported: true,
      error: null,
      requestPermission: vi.fn(),
    });

    rerender({ beta: 0, gamma: 0 });

    await waitFor(() => {
      expect(result.current.isGyroActive).toBe(true);
    });

    const initialIntensity = result.current.causticsIntensity;

    // Simulate motion
    vi.mocked(useDeviceOrientation).mockReturnValue({
      orientation: { alpha: 0, beta: 45, gamma: 30 },
      isSupported: true,
      error: null,
      requestPermission: vi.fn(),
    });

    rerender({ beta: 45, gamma: 30 });

    // Intensity should adjust based on motion (may be higher due to motion boost)
    expect(result.current.causticsIntensity).toBeGreaterThanOrEqual(initialIntensity * 0.9);
  });

  it('smooths orientation values to reduce jitter', async () => {
    vi.mocked(useDeviceOrientation).mockReturnValue({
      orientation: { alpha: 0, beta: 10, gamma: 20 },
      isSupported: true,
      error: null,
      requestPermission: vi.fn(),
    });

    const { result } = renderHook(() =>
      useGyroscopeCaustics({ smoothingFactor: 0.9 })
    );

    await waitFor(() => {
      expect(result.current.isGyroActive).toBe(true);
    });

    // Smoothed values should be defined
    expect(typeof result.current.smoothedBeta).toBe('number');
    expect(typeof result.current.smoothedGamma).toBe('number');
  });

  it('adapts quality based on device performance', () => {
    vi.mocked(useDeviceOrientation).mockReturnValue({
      orientation: { alpha: 0, beta: 0, gamma: 0 },
      isSupported: true,
      error: null,
      requestPermission: vi.fn(),
    });

    vi.mocked(useDevicePerformance).mockReturnValue({
      quality: 'high',
      maxParticles: 5000,
      enablePostProcessing: true,
      shadowQuality: 'high',
    });

    const { result } = renderHook(() => useGyroscopeCaustics());

    expect(result.current.quality).toBe('high');
  });

  it('falls back to animated light when gyro data is null', () => {
    vi.mocked(useDeviceOrientation).mockReturnValue({
      orientation: { alpha: 0, beta: null, gamma: null },
      isSupported: true,
      error: null,
      requestPermission: vi.fn(),
    });

    const { result } = renderHook(() => useGyroscopeCaustics());

    expect(result.current.isGyroActive).toBe(false);
    expect(result.current.lightDirection).toBeDefined();
  });

  it('normalizes light direction vector', async () => {
    vi.mocked(useDeviceOrientation).mockReturnValue({
      orientation: { alpha: 0, beta: 45, gamma: 45 },
      isSupported: true,
      error: null,
      requestPermission: vi.fn(),
    });

    const { result } = renderHook(() => useGyroscopeCaustics());

    await waitFor(() => {
      expect(result.current.isGyroActive).toBe(true);
    });

    const [x, y, z] = result.current.lightDirection;
    const length = Math.sqrt(x * x + y * y + z * z);

    // Vector should be normalized (length ~= 1)
    expect(length).toBeCloseTo(1.0, 1);
  });
});

describe('calculateLightDirection', () => {
  it('calculates light direction from beta and gamma', () => {
    const direction = calculateLightDirection(45, 30);

    expect(Array.isArray(direction)).toBe(true);
    expect(direction.length).toBe(3);

    // Check that the result is normalized
    const [x, y, z] = direction;
    const length = Math.sqrt(x * x + y * y + z * z);
    expect(length).toBeCloseTo(1.0, 1);
  });

  it('handles zero angles', () => {
    const direction = calculateLightDirection(0, 0);

    expect(Array.isArray(direction)).toBe(true);
    expect(direction.length).toBe(3);

    const [x, y, z] = direction;
    const length = Math.sqrt(x * x + y * y + z * z);
    expect(length).toBeCloseTo(1.0, 1);
  });

  it('handles extreme angles', () => {
    const direction = calculateLightDirection(90, 90);

    expect(Array.isArray(direction)).toBe(true);
    const [x, y, z] = direction;
    const length = Math.sqrt(x * x + y * y + z * z);
    expect(length).toBeCloseTo(1.0, 1);
  });
});

describe('interpolateLightDirection', () => {
  it('interpolates between two directions at t=0', () => {
    const dir1: [number, number, number] = [1, 0, 0];
    const dir2: [number, number, number] = [0, 1, 0];

    const result = interpolateLightDirection(dir1, dir2, 0);

    // At t=0, should be close to dir1 (normalized)
    expect(result[0]).toBeCloseTo(1, 1);
    expect(result[1]).toBeCloseTo(0, 1);
    expect(result[2]).toBeCloseTo(0, 1);
  });

  it('interpolates between two directions at t=1', () => {
    const dir1: [number, number, number] = [1, 0, 0];
    const dir2: [number, number, number] = [0, 1, 0];

    const result = interpolateLightDirection(dir1, dir2, 1);

    // At t=1, should be close to dir2 (normalized)
    expect(result[0]).toBeCloseTo(0, 1);
    expect(result[1]).toBeCloseTo(1, 1);
    expect(result[2]).toBeCloseTo(0, 1);
  });

  it('interpolates between two directions at t=0.5', () => {
    const dir1: [number, number, number] = [1, 0, 0];
    const dir2: [number, number, number] = [0, 1, 0];

    const result = interpolateLightDirection(dir1, dir2, 0.5);

    // At t=0.5, should be halfway between (normalized)
    const [x, y, z] = result;
    const length = Math.sqrt(x * x + y * y + z * z);
    expect(length).toBeCloseTo(1.0, 1);

    // Should be roughly equal in x and y components
    expect(Math.abs(x - y)).toBeLessThan(0.1);
  });

  it('normalizes interpolated result', () => {
    const dir1: [number, number, number] = [0.5, 0.5, 0.5];
    const dir2: [number, number, number] = [0.3, 0.7, 0.2];

    const result = interpolateLightDirection(dir1, dir2, 0.3);

    const [x, y, z] = result;
    const length = Math.sqrt(x * x + y * y + z * z);
    expect(length).toBeCloseTo(1.0, 1);
  });
});
