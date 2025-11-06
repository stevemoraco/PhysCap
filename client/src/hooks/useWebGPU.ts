import { useState, useEffect } from 'react';

export interface WebGPUSupport {
  isSupported: boolean;
  adapter: GPUAdapter | null;
  device: GPUDevice | null;
  error: string | null;
  gpuInfo: {
    vendor: string;
    architecture: string;
    tier: 'high' | 'medium' | 'low';
  } | null;
}

export function useWebGPU(): WebGPUSupport {
  const [support, setSupport] = useState<WebGPUSupport>({
    isSupported: false,
    adapter: null,
    device: null,
    error: null,
    gpuInfo: null,
  });

  useEffect(() => {
    let mounted = true;

    async function initWebGPU() {
      try {
        // Check if WebGPU is available
        if (!navigator.gpu) {
          throw new Error('WebGPU not supported in this browser');
        }

        // Request adapter
        const adapter = await navigator.gpu.requestAdapter({
          powerPreference: 'high-performance',
        });

        if (!adapter) {
          throw new Error('Failed to get WebGPU adapter');
        }

        // Get adapter info for GPU tier detection
        // Note: requestAdapterInfo() is available in WebGPU but may not be in all type definitions
        const adapterInfo = await (adapter as any).requestAdapterInfo?.() || {};
        const vendor = adapterInfo.vendor || 'Unknown';
        const architecture = adapterInfo.architecture || 'Unknown';

        // Determine GPU tier based on vendor and features
        let tier: 'high' | 'medium' | 'low' = 'medium';

        // High-end GPUs
        if (vendor.toLowerCase().includes('nvidia') ||
            vendor.toLowerCase().includes('amd') ||
            architecture.toLowerCase().includes('discrete')) {
          tier = 'high';
        }
        // Integrated/mobile GPUs
        else if (vendor.toLowerCase().includes('intel') ||
                 architecture.toLowerCase().includes('integrated') ||
                 /Android|iPhone|iPad/i.test(navigator.userAgent)) {
          tier = 'low';
        }

        // Request device with appropriate limits
        const requiredFeatures: GPUFeatureName[] = [];
        const requiredLimits: Record<string, number> = {};

        const device = await adapter.requestDevice({
          requiredFeatures,
          requiredLimits,
        });

        if (!mounted) {
          device.destroy();
          return;
        }

        // Setup error handling
        device.addEventListener('uncapturederror', (event) => {
          console.error('WebGPU uncaptured error:', event.error);
        });

        setSupport({
          isSupported: true,
          adapter,
          device,
          error: null,
          gpuInfo: {
            vendor,
            architecture,
            tier,
          },
        });
      } catch (error) {
        if (!mounted) return;

        const errorMessage = error instanceof Error ? error.message : 'Unknown WebGPU error';
        console.warn('WebGPU initialization failed:', errorMessage);

        setSupport({
          isSupported: false,
          adapter: null,
          device: null,
          error: errorMessage,
          gpuInfo: null,
        });
      }
    }

    initWebGPU();

    return () => {
      mounted = false;
      if (support.device) {
        support.device.destroy();
      }
    };
  }, []);

  return support;
}

export function isWebGPUSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}
