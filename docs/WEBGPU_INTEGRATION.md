# WebGPU Solar Manufacturing Visualization - Integration Guide

## Overview

This document describes the WebGPU rendering pipeline implementation for Physical.Capital's solar manufacturing visualization. The system uses TypeGPU for GPU-accelerated ray marching, physically-based materials, real-time caustics, and gyroscope-reactive lighting.

## Architecture

### Core Components

#### 1. **WebGPU Detection & Initialization** (`useWebGPU.ts`)
- Detects WebGPU support across browsers
- Initializes GPU adapter and device
- Classifies GPU tier (high/medium/low) for adaptive quality
- Exports `isWebGPUSupported()` utility function

#### 2. **Materials Library** (`materials.ts`)
- Physically-based materials: Gold, Diamond, Emerald, Solar Glass, Silicon
- Fresnel-Schlick reflections with real IOR values
- Beer-Lambert subsurface scattering
- Material property packing for GPU uniforms

#### 3. **Performance System** (`performance.ts`)
- Three quality presets: High (1024px caustics, 60fps), Medium (512px, 30fps), Low (256px baked, 30fps)
- Real-time FPS monitoring with auto-downgrade
- Progressive loading with 6 stages (init → shaders → textures → geometry → caustics → ready)
- Frame budget system for maintaining target FPS

#### 4. **Temporal Anti-Aliasing** (`taa.ts`)
- Halton sequence jitter pattern for deterministic sampling
- 8-frame history accumulation (high quality)
- Variance clipping to reduce ghosting
- YCoCg color space for better neighborhood statistics

#### 5. **Caustics System** (`caustics.ts`)
- Photon tracing compute shader (up to 10,000 photons)
- Wavelength-dependent IOR for chromatic dispersion
- Mobile optimization: Pre-bake caustics at 8x8x8 orientation grid
- Real-time caustics for desktop GPUs

#### 6. **Gyroscope Integration** (`useGyroscopeCaustics.ts`)
- Maps device orientation (beta/gamma) to light direction vector
- Exponential smoothing (80% factor) to reduce jitter
- Auto-intensity: Increases caustics during motion
- Fallback to circular light animation for non-gyro devices

#### 7. **Render Pipeline** (`pipeline.ts`)
- TypeGPU-based ray marching with SDF (signed distance fields)
- 5 scene objects: Solar panels (8), Robots (3), Floor, Factory elements
- Soft shadows with ray marching
- Ambient occlusion (5 samples)
- Fog with exponential falloff

#### 8. **Main Component** (`SolarManufacturingWebGPU.tsx`)
- 5 clickable manufacturing stages:
  1. **Polysilicon Purification** - Glowing molten silicon
  2. **Wafer Slicing** - Diamond wire saw
  3. **Cell Processing** - HJT plasma coating
  4. **Module Assembly** - Glass lamination
  5. **Quality Inspection** - Robot arms
- Emits `onStageClick(stageId)` and `onStageInteraction(stageId, duration)` events
- Camera zoom on stage selection
- WebGPU fallback to Three.js component

---

## Browser Support

### WebGPU Compatibility (as of 2025)

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| **Chrome** | ✅ 113+ | ✅ 121+ | Full support |
| **Edge** | ✅ 113+ | ✅ 121+ | Chromium-based |
| **Safari** | ✅ 17.4+ | ✅ 17.4+ | Experimental flag required on older versions |
| **Firefox** | ⚠️ Nightly | ❌ | Experimental, not production-ready |
| **Opera** | ✅ 99+ | ✅ 81+ | Chromium-based |

**Fallback:** Component automatically renders `<SolarManufacturing3D />` (Three.js) if WebGPU unavailable.

---

## Performance Targets

### Desktop (High Quality)
- **Target:** 60fps
- **Caustics:** 1024×1024 real-time photon tracing
- **Ray Steps:** 128 (main), 32 (shadow)
- **TAA:** 8-frame history with Halton jitter
- **Load Time:** <2.5s

### Mobile/Tablet (Medium Quality)
- **Target:** 30fps
- **Caustics:** 512×512 real-time
- **Ray Steps:** 64 (main), 16 (shadow)
- **TAA:** 4-frame history
- **Load Time:** <3.5s

### Low-End Mobile (Low Quality)
- **Target:** 30fps
- **Caustics:** 256×256 pre-baked (8×8×8 grid)
- **Ray Steps:** 32 (main), 8 (shadow)
- **TAA:** Disabled
- **Load Time:** <4s (including baking)

---

## Integration Instructions

### For Agent B (Experiences)

**Import the WebGPU component:**
```tsx
import { SolarManufacturingWebGPU } from '@/components/webgpu/SolarManufacturingWebGPU';
import { SolarManufacturing3D } from '@/components/SolarManufacturing3D';

// Use with automatic fallback
<SolarManufacturingWebGPU
  className="w-full h-[600px]"
  fallback={<SolarManufacturing3D className="w-full h-[600px]" />}
/>
```

**Detect WebGPU before rendering:**
```tsx
import { isWebGPUSupported } from '@/hooks/useWebGPU';

const VisualizationComponent = () => {
  const hasWebGPU = isWebGPUSupported();

  return hasWebGPU
    ? <SolarManufacturingWebGPU />
    : <SolarManufacturing3D />;
};
```

### For Agent C (Personalization)

**Wire telemetry events:**
```tsx
import { useInteractionTracking } from '@/hooks/useInteractionTracking';

const { trackInteraction } = useInteractionTracking();

<SolarManufacturingWebGPU
  onStageClick={(stageId) => {
    trackInteraction('stage_click', { stageId });
  }}
  onStageInteraction={(stageId, duration) => {
    trackInteraction('stage_view', { stageId, duration });
  }}
/>
```

**Access caustics data for personalization:**
```tsx
import { useGyroscopeCaustics } from '@/hooks/useGyroscopeCaustics';

const PersonalizedVisualization = () => {
  const gyro = useGyroscopeCaustics();

  // Use gyro.causticsIntensity, gyro.quality, gyro.isGyroActive
  // for personalized experiences
};
```

### For Agent D (Testing)

**Test WebGPU detection:**
```tsx
import { isWebGPUSupported } from '@/hooks/useWebGPU';

describe('WebGPU Support', () => {
  it('should detect WebGPU availability', () => {
    const supported = isWebGPUSupported();
    expect(typeof supported).toBe('boolean');
  });
});
```

**Mock WebGPU for tests:**
```tsx
<SolarManufacturingWebGPU
  mockWebGPU={true}
  fallback={<div>Fallback rendered</div>}
/>
```

**Test stage interactions:**
```tsx
const mockStageClick = jest.fn();

render(
  <SolarManufacturingWebGPU
    onStageClick={mockStageClick}
    mockWebGPU={true}
  />
);

fireEvent.click(screen.getByText('Polysilicon Purification'));
expect(mockStageClick).toHaveBeenCalledWith('polysilicon');
```

---

## File Structure

```
client/src/
├── components/webgpu/
│   └── SolarManufacturingWebGPU.tsx    # Main component (5 stages, events)
├── hooks/
│   ├── useWebGPU.ts                    # WebGPU detection & init
│   └── useGyroscopeCaustics.ts         # Gyro → caustics integration
└── lib/webgpu/
    ├── pipeline.ts                      # TypeGPU ray marching pipeline
    ├── materials.ts                     # PBR material library
    ├── caustics.ts                      # Photon tracing compute shader
    ├── taa.ts                           # Temporal anti-aliasing
    └── performance.ts                   # Adaptive quality system
```

---

## Technical Specifications

### Memory Budget
- **Total Assets:** <10MB
- **Caustics Texture:** 4MB (1024² RGBA16F)
- **TAA History:** 8MB (8 frames × 1024² RGBA16F)
- **Geometry:** <1MB (procedural SDFs, no mesh data)

### Shader Features
- **Ray Marching:** Up to 128 steps per pixel
- **SDF Primitives:** Box, sphere, cylinder, plane, torus
- **Lighting:** PBR with Cook-Torrance BRDF
- **Shadows:** Soft shadows via ray marching
- **AO:** 5-sample ambient occlusion
- **Fog:** Exponential distance fog

### Manufacturing Stages
Each stage is a 3D "station" with:
- Unique position in circular layout
- Color-coded label
- Clickable interaction
- Camera zoom target
- Description panel overlay

---

## Troubleshooting

### WebGPU Not Detected
1. Check browser version (Chrome 113+, Safari 17.4+)
2. Ensure hardware acceleration enabled in browser settings
3. On Safari, enable "WebGPU" flag in Develop menu

### Low FPS
1. System automatically downgrades quality (monitor overlay shows current quality)
2. Manual override: Force low quality on mobile with `quality="low"` prop
3. Check GPU tier detection: Integrated GPUs default to "low"

### Caustics Not Visible
1. Verify gyroscope permission granted (mobile)
2. Check light direction in debug overlay
3. For baked caustics (low quality), ensure baking completed (progress bar)

### TAA Ghosting
1. Reduce TAA history frames (edit `TAAPresets` in taa.ts)
2. Increase blend factor (less history weight)
3. Disable velocity rejection for static scenes

---

## Future Enhancements

### Planned Features
- [ ] Screen-space reflections (SSR)
- [ ] Volumetric lighting for molten silicon
- [ ] Particle systems for welding sparks
- [ ] HDR environment maps
- [ ] Async shader compilation
- [ ] GPU-based occlusion culling

### Performance Optimizations
- [ ] Compute shader for ray marching (currently fragment shader)
- [ ] Persistent uniform buffers (reduce CPU→GPU copies)
- [ ] Texture atlasing for caustics grid
- [ ] Web Workers for caustics baking

---

## Coordination Notes

### Agent B Dependencies
- **Import:** `SolarManufacturingWebGPU` with fallback prop
- **Fallback:** Existing `SolarManufacturing3D` component
- **Detection:** Use `isWebGPUSupported()` before mounting

### Agent C Dependencies
- **Events:** `onStageClick`, `onStageInteraction` wired to tracking
- **Export:** `useGyroscopeCaustics` hook for personalization data

### Agent D Dependencies
- **Mock Mode:** `mockWebGPU={true}` disables GPU init
- **Export:** `isWebGPUSupported()` for feature detection tests
- **No GPU tests:** All logic testable without WebGPU context

---

## Credits

**Implementation:** Agent A (GPU Rendering Engineer)
**Technologies:** TypeGPU, WebGPU API, TypeScript, React
**Performance Budget:** <10MB, 60fps desktop, 30fps mobile
**Load Time:** <2.5s (desktop), <4s (mobile with baking)

Generated with Claude Code - Physical.Capital WebGPU Pipeline
