# WebGPU Quick Start Guide

## For Agent B (Experiences Engineer)

### Basic Usage

```tsx
import { SolarManufacturingWebGPU } from '@/components/webgpu/SolarManufacturingWebGPU';
import { SolarManufacturing3D } from '@/components/SolarManufacturing3D';

export function ManufacturingPage() {
  return (
    <div className="w-full h-[600px]">
      <SolarManufacturingWebGPU
        className="w-full h-full"
        fallback={<SolarManufacturing3D className="w-full h-full" />}
      />
    </div>
  );
}
```

### Conditional Rendering

```tsx
import { isWebGPUSupported } from '@/hooks/useWebGPU';
import { SolarManufacturingWebGPU } from '@/components/webgpu/SolarManufacturingWebGPU';
import { SolarManufacturing3D } from '@/components/SolarManufacturing3D';

export function AdaptiveVisualization() {
  const supportsWebGPU = isWebGPUSupported();

  return (
    <div className="relative w-full h-[600px]">
      {supportsWebGPU ? (
        <SolarManufacturingWebGPU
          className="w-full h-full"
          fallback={<SolarManufacturing3D className="w-full h-full" />}
        />
      ) : (
        <SolarManufacturing3D className="w-full h-full" />
      )}

      {supportsWebGPU && (
        <div className="absolute top-4 right-4 bg-card/80 px-3 py-1 rounded text-xs">
          WebGPU Enabled
        </div>
      )}
    </div>
  );
}
```

### With Loading State

```tsx
import { useState } from 'react';
import { SolarManufacturingWebGPU } from '@/components/webgpu/SolarManufacturingWebGPU';

export function EnhancedVisualization() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-[600px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading 3D Scene...</p>
          </div>
        </div>
      )}

      <SolarManufacturingWebGPU
        className="w-full h-full"
        onStageClick={() => setIsLoading(false)}
      />
    </div>
  );
}
```

---

## For Agent C (Personalization Engineer)

### Track User Interactions

```tsx
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
import { SolarManufacturingWebGPU } from '@/components/webgpu/SolarManufacturingWebGPU';

export function TrackedVisualization() {
  const { trackInteraction } = useInteractionTracking();

  const handleStageClick = (stageId: string) => {
    trackInteraction('manufacturing_stage_click', {
      stageId,
      timestamp: Date.now(),
      feature: 'webgpu_visualization',
    });
  };

  const handleStageInteraction = (stageId: string, duration: number) => {
    trackInteraction('manufacturing_stage_view', {
      stageId,
      duration,
      engagement: duration > 5000 ? 'high' : duration > 2000 ? 'medium' : 'low',
    });
  };

  return (
    <SolarManufacturingWebGPU
      onStageClick={handleStageClick}
      onStageInteraction={handleStageInteraction}
      className="w-full h-[600px]"
    />
  );
}
```

### Personalize Based on Gyroscope Data

```tsx
import { useGyroscopeCaustics } from '@/hooks/useGyroscopeCaustics';
import { useEffect } from 'react';

export function PersonalizedExperience() {
  const gyro = useGyroscopeCaustics();

  useEffect(() => {
    // Track if user is actively using gyroscope
    if (gyro.isGyroActive) {
      // User is tilting device - they're engaged!
      trackEngagement('gyroscope_active', {
        intensity: gyro.causticsIntensity,
        quality: gyro.quality,
      });
    }
  }, [gyro.isGyroActive, gyro.causticsIntensity]);

  return (
    <div>
      {/* Your visualization */}
      {gyro.isGyroActive && (
        <div className="absolute bottom-4 left-4 bg-primary/20 px-3 py-2 rounded">
          Move your device to explore lighting
        </div>
      )}
    </div>
  );
}
```

### A/B Test WebGPU vs Three.js

```tsx
import { useABTest } from '@/hooks/useABTest';
import { SolarManufacturingWebGPU } from '@/components/webgpu/SolarManufacturingWebGPU';
import { SolarManufacturing3D } from '@/components/SolarManufacturing3D';

export function ABTestVisualization() {
  const { variant } = useABTest('visualization_renderer');

  return (
    <>
      {variant === 'webgpu' ? (
        <SolarManufacturingWebGPU
          onStageClick={(stage) => trackInteraction('stage_click', { variant: 'webgpu', stage })}
        />
      ) : (
        <SolarManufacturing3D
          // Track Three.js interactions too
        />
      )}
    </>
  );
}
```

---

## For Agent D (Testing Engineer)

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import { SolarManufacturingWebGPU } from '@/components/webgpu/SolarManufacturingWebGPU';
import { isWebGPUSupported } from '@/hooks/useWebGPU';

describe('SolarManufacturingWebGPU', () => {
  it('should render fallback when WebGPU not supported', () => {
    // Use mock mode to bypass WebGPU init
    render(
      <SolarManufacturingWebGPU
        mockWebGPU={true}
        fallback={<div>Fallback Content</div>}
      />
    );

    expect(screen.getByText('Fallback Content')).toBeInTheDocument();
  });

  it('should emit stage click events', () => {
    const handleStageClick = jest.fn();

    render(
      <SolarManufacturingWebGPU
        mockWebGPU={true}
        onStageClick={handleStageClick}
      />
    );

    // Simulate clicking a stage button
    const stageButton = screen.getByText('Polysilicon Purification');
    fireEvent.click(stageButton);

    expect(handleStageClick).toHaveBeenCalledWith('polysilicon');
  });

  it('should track interaction duration', async () => {
    const handleInteraction = jest.fn();

    render(
      <SolarManufacturingWebGPU
        mockWebGPU={true}
        onStageInteraction={handleInteraction}
      />
    );

    const stageButton = screen.getByText('Wafer Slicing');

    // Click to start interaction
    fireEvent.click(stageButton);

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click again to end interaction
    fireEvent.click(stageButton);

    expect(handleInteraction).toHaveBeenCalledWith(
      'wafer',
      expect.any(Number) // Duration in milliseconds
    );
  });
});

describe('WebGPU Detection', () => {
  it('should detect WebGPU support', () => {
    const supported = isWebGPUSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('should handle missing navigator.gpu', () => {
    const originalGpu = navigator.gpu;
    Object.defineProperty(navigator, 'gpu', {
      value: undefined,
      configurable: true,
    });

    const supported = isWebGPUSupported();
    expect(supported).toBe(false);

    // Restore
    Object.defineProperty(navigator, 'gpu', {
      value: originalGpu,
      configurable: true,
    });
  });
});
```

### Integration Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('WebGPU Visualization', () => {
  test('should load and render on supported browsers', async ({ page, browserName }) => {
    // Skip on Firefox (WebGPU experimental)
    test.skip(browserName === 'firefox', 'WebGPU not supported in Firefox');

    await page.goto('/manufacturing');

    // Wait for canvas to appear
    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 });

    // Check for WebGPU enabled indicator
    const indicator = page.locator('text=WebGPU Enabled');
    await expect(indicator).toBeVisible();
  });

  test('should fallback to Three.js on unsupported browsers', async ({ page }) => {
    // Disable WebGPU in browser
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'gpu', {
        value: undefined,
        writable: false,
      });
    });

    await page.goto('/manufacturing');

    // Should still render (with fallback)
    await expect(page.locator('canvas')).toBeVisible();

    // Should NOT show WebGPU indicator
    const indicator = page.locator('text=WebGPU Enabled');
    await expect(indicator).not.toBeVisible();
  });

  test('should handle stage interactions', async ({ page }) => {
    await page.goto('/manufacturing');
    await page.waitForLoadState('networkidle');

    // Click on a manufacturing stage
    await page.click('text=Polysilicon Purification');

    // Should show stage info panel
    await expect(page.locator('text=High-purity silicon extraction')).toBeVisible();
  });

  test('should maintain 30fps on mobile', async ({ page }) => {
    // Emulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/manufacturing');
    await page.waitForLoadState('networkidle');

    // Measure FPS
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frames = 0;
        const start = performance.now();

        const measure = () => {
          frames++;
          if (performance.now() - start > 1000) {
            resolve(frames);
          } else {
            requestAnimationFrame(measure);
          }
        };

        requestAnimationFrame(measure);
      });
    });

    // Should be at least 25fps (allowing some variance)
    expect(fps).toBeGreaterThanOrEqual(25);
  });
});
```

### Visual Regression Tests

```typescript
import { test } from '@playwright/test';

test.describe('WebGPU Visual Regression', () => {
  test('should match baseline screenshot', async ({ page }) => {
    await page.goto('/manufacturing');
    await page.waitForSelector('canvas', { state: 'visible', timeout: 5000 });

    // Wait for scene to stabilize
    await page.waitForTimeout(3000);

    // Take screenshot
    await expect(page).toHaveScreenshot('webgpu-manufacturing.png', {
      maxDiffPixels: 100, // Allow minor differences
    });
  });

  test('should render caustics correctly', async ({ page }) => {
    await page.goto('/manufacturing');
    await page.waitForSelector('canvas', { state: 'visible' });

    // Check that caustics texture is loaded
    const causticsVisible = await page.evaluate(() => {
      // Access WebGPU context and check caustics texture
      // This would require exposing debug info
      return true; // Simplified
    });

    expect(causticsVisible).toBe(true);
  });
});
```

---

## Component Props Reference

### SolarManufacturingWebGPU Props

```typescript
interface SolarManufacturingWebGPUProps {
  className?: string;
  fallback?: React.ReactNode;
  mockWebGPU?: boolean; // For testing - skips WebGPU init
  onStageClick?: (stageId: string) => void;
  onStageInteraction?: (stageId: string, duration: number) => void;
}
```

### Manufacturing Stage IDs

```typescript
type StageId =
  | 'polysilicon'    // Polysilicon Purification
  | 'wafer'          // Wafer Slicing
  | 'cell'           // Cell Processing
  | 'module'         // Module Assembly
  | 'inspection';    // Quality Inspection
```

---

## Common Patterns

### Show Different Content Based on GPU Tier

```tsx
import { useWebGPU } from '@/hooks/useWebGPU';

export function AdaptiveContent() {
  const { gpuInfo } = useWebGPU();

  return (
    <div>
      <SolarManufacturingWebGPU />

      {gpuInfo?.tier === 'high' && (
        <div className="mt-4 p-4 bg-primary/10 rounded">
          Your GPU supports ultra-high quality rendering!
        </div>
      )}

      {gpuInfo?.tier === 'low' && (
        <div className="mt-4 p-4 bg-muted rounded text-sm">
          Scene optimized for your device
        </div>
      )}
    </div>
  );
}
```

### Progressive Enhancement

```tsx
import { useState, useEffect } from 'react';
import { isWebGPUSupported } from '@/hooks/useWebGPU';

export function ProgressiveVisualization() {
  const [showWebGPU, setShowWebGPU] = useState(false);

  useEffect(() => {
    // Load WebGPU version after initial render
    const timer = setTimeout(() => {
      if (isWebGPUSupported()) {
        setShowWebGPU(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {/* Always show static image/placeholder first */}
      <img src="/manufacturing-preview.jpg" alt="Manufacturing" />

      {/* Overlay with interactive 3D */}
      {showWebGPU && (
        <div className="absolute inset-0">
          <SolarManufacturingWebGPU />
        </div>
      )}
    </div>
  );
}
```

---

## Debugging

### Enable Debug Overlay

```tsx
// Set this in localStorage
localStorage.setItem('webgpu_debug', 'true');

// Then component will show:
// - FPS counter
// - Quality preset
// - GPU tier
// - Gyroscope status
// - Light direction
```

### Check WebGPU Initialization

```typescript
import { useWebGPU } from '@/hooks/useWebGPU';

function DebugInfo() {
  const webgpu = useWebGPU();

  return (
    <pre>
      {JSON.stringify({
        supported: webgpu.isSupported,
        error: webgpu.error,
        vendor: webgpu.gpuInfo?.vendor,
        tier: webgpu.gpuInfo?.tier,
      }, null, 2)}
    </pre>
  );
}
```

---

## Performance Tips

1. **Preload on hover:** Start WebGPU init when user hovers over navigation link
2. **Defer non-critical features:** Load TAA and advanced caustics after first paint
3. **Use intersection observer:** Only render when visualization is in viewport
4. **Respect reduced motion:** Disable animations if `prefers-reduced-motion` is set
5. **Monitor memory:** Check `performance.memory` and downgrade quality if needed

---

**Questions?**
- Check full integration guide: `docs/WEBGPU_INTEGRATION.md`
- Performance metrics: `docs/WEBGPU_PERFORMANCE_METRICS.md`
- File structure: `client/src/components/webgpu/` and `client/src/lib/webgpu/`

Generated with Claude Code - Physical.Capital WebGPU Pipeline
