import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

describe('useDeviceOrientation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null values initially', () => {
    const { result } = renderHook(() => useDeviceOrientation());

    expect(result.current.orientation).toEqual({
      alpha: null,
      beta: null,
      gamma: null,
    });
  });

  it('detects device orientation support', () => {
    const { result } = renderHook(() => useDeviceOrientation());

    expect(result.current.isSupported).toBe(true);
  });

  it('updates orientation on device orientation event', () => {
    const { result } = renderHook(() => useDeviceOrientation());

    const mockEvent = new Event('deviceorientation') as DeviceOrientationEvent;
    Object.defineProperty(mockEvent, 'alpha', { value: 10 });
    Object.defineProperty(mockEvent, 'beta', { value: 20 });
    Object.defineProperty(mockEvent, 'gamma', { value: 30 });

    act(() => {
      window.dispatchEvent(mockEvent);
    });

    expect(result.current.orientation.alpha).toBe(10);
    expect(result.current.orientation.beta).toBe(20);
    expect(result.current.orientation.gamma).toBe(30);
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useDeviceOrientation());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'deviceorientation',
      expect.any(Function)
    );
  });
});
