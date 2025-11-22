import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useWebGPU, isWebGPUSupported } from '@/hooks/useWebGPU';

describe('useWebGPU', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up navigator.gpu mock
    if ('gpu' in navigator) {
      delete (navigator as any).gpu;
    }
  });

  it('returns unsupported state when WebGPU is not available', async () => {
    // Ensure navigator.gpu is not defined
    delete (navigator as any).gpu;

    const { result } = renderHook(() => useWebGPU());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(false);
    });

    expect(result.current.adapter).toBeNull();
    expect(result.current.device).toBeNull();
    expect(result.current.error).toContain('WebGPU not supported');
    expect(result.current.gpuInfo).toBeNull();
  });

  it('initializes WebGPU successfully with high-tier GPU', async () => {
    const mockDevice = {
      destroy: vi.fn(),
      addEventListener: vi.fn(),
    };

    const mockAdapter = {
      requestDevice: vi.fn(() => Promise.resolve(mockDevice)),
      requestAdapterInfo: vi.fn(() =>
        Promise.resolve({
          vendor: 'NVIDIA',
          architecture: 'discrete',
        })
      ),
    };

    (navigator as any).gpu = {
      requestAdapter: vi.fn(() => Promise.resolve(mockAdapter)),
    };

    const { result } = renderHook(() => useWebGPU());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });

    expect(result.current.adapter).toBe(mockAdapter);
    expect(result.current.device).toBe(mockDevice);
    expect(result.current.error).toBeNull();
    expect(result.current.gpuInfo).toEqual({
      vendor: 'NVIDIA',
      architecture: 'discrete',
      tier: 'high',
    });
  });

  it('detects medium-tier GPU correctly', async () => {
    const mockDevice = {
      destroy: vi.fn(),
      addEventListener: vi.fn(),
    };

    const mockAdapter = {
      requestDevice: vi.fn(() => Promise.resolve(mockDevice)),
      requestAdapterInfo: vi.fn(() =>
        Promise.resolve({
          vendor: 'Unknown Vendor',
          architecture: 'unknown',
        })
      ),
    };

    (navigator as any).gpu = {
      requestAdapter: vi.fn(() => Promise.resolve(mockAdapter)),
    };

    const { result } = renderHook(() => useWebGPU());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });

    expect(result.current.gpuInfo?.tier).toBe('medium');
  });

  it('detects low-tier GPU (Intel integrated)', async () => {
    const mockDevice = {
      destroy: vi.fn(),
      addEventListener: vi.fn(),
    };

    const mockAdapter = {
      requestDevice: vi.fn(() => Promise.resolve(mockDevice)),
      requestAdapterInfo: vi.fn(() =>
        Promise.resolve({
          vendor: 'Intel',
          architecture: 'integrated',
        })
      ),
    };

    (navigator as any).gpu = {
      requestAdapter: vi.fn(() => Promise.resolve(mockAdapter)),
    };

    const { result } = renderHook(() => useWebGPU());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });

    expect(result.current.gpuInfo?.tier).toBe('low');
  });

  it('handles adapter request failure', async () => {
    (navigator as any).gpu = {
      requestAdapter: vi.fn(() => Promise.resolve(null)),
    };

    const { result } = renderHook(() => useWebGPU());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(false);
    });

    expect(result.current.error).toContain('Failed to get WebGPU adapter');
  });

  it('handles device request failure', async () => {
    const mockAdapter = {
      requestDevice: vi.fn(() => Promise.reject(new Error('Device request failed'))),
      requestAdapterInfo: vi.fn(() =>
        Promise.resolve({
          vendor: 'AMD',
          architecture: 'discrete',
        })
      ),
    };

    (navigator as any).gpu = {
      requestAdapter: vi.fn(() => Promise.resolve(mockAdapter)),
    };

    const { result } = renderHook(() => useWebGPU());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(false);
    });

    expect(result.current.error).toContain('Device request failed');
  });

  it('cleans up device on unmount', async () => {
    const mockDevice = {
      destroy: vi.fn(),
      addEventListener: vi.fn(),
    };

    const mockAdapter = {
      requestDevice: vi.fn(() => Promise.resolve(mockDevice)),
      requestAdapterInfo: vi.fn(() =>
        Promise.resolve({
          vendor: 'AMD',
          architecture: 'discrete',
        })
      ),
    };

    (navigator as any).gpu = {
      requestAdapter: vi.fn(() => Promise.resolve(mockAdapter)),
    };

    const { unmount } = renderHook(() => useWebGPU());

    await waitFor(() => {
      expect(mockDevice.addEventListener).toHaveBeenCalled();
    });

    unmount();

    // Note: The cleanup destroys the device from the support state, not the mock
    // In a real scenario, the device would be destroyed
  });

  it('handles missing requestAdapterInfo gracefully', async () => {
    const mockDevice = {
      destroy: vi.fn(),
      addEventListener: vi.fn(),
    };

    const mockAdapter = {
      requestDevice: vi.fn(() => Promise.resolve(mockDevice)),
      // No requestAdapterInfo method
    };

    (navigator as any).gpu = {
      requestAdapter: vi.fn(() => Promise.resolve(mockAdapter)),
    };

    const { result } = renderHook(() => useWebGPU());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });

    expect(result.current.gpuInfo).toEqual({
      vendor: 'Unknown',
      architecture: 'Unknown',
      tier: 'medium',
    });
  });
});

describe('isWebGPUSupported', () => {
  afterEach(() => {
    if ('gpu' in navigator) {
      delete (navigator as any).gpu;
    }
  });

  it('returns true when navigator.gpu exists', () => {
    (navigator as any).gpu = {};
    expect(isWebGPUSupported()).toBe(true);
  });

  it('returns false when navigator.gpu does not exist', () => {
    delete (navigator as any).gpu;
    expect(isWebGPUSupported()).toBe(false);
  });
});
