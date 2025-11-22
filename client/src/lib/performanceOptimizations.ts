import { lazy } from 'react';
import * as THREE from 'three';

// Lazy load 3D scenes for better initial page load
export function lazyLoad3DScene(importFn: () => Promise<any>) {
  return lazy(importFn);
}

// GPU tier detection for quality settings
export type GPUTier = 'high' | 'medium' | 'low';

export function detectGPUTier(): GPUTier {
  // Check for WebGPU support (high-end)
  if ('gpu' in navigator && (navigator as any).gpu) {
    return 'high';
  }

  // Check WebGL capabilities
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    return 'low';
  }

  // Check for specific GPU capabilities
  const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    // High-end GPUs
    if (/NVIDIA|AMD Radeon RX|Apple M[0-9]|Mali-G[7-9]/i.test(renderer)) {
      return 'high';
    }

    // Low-end integrated GPUs
    if (/Intel.*HD|Mali-4|Adreno [0-5]/i.test(renderer)) {
      return 'low';
    }
  }

  // Check hardware concurrency as fallback
  const cores = (navigator as Navigator).hardwareConcurrency || 2;
  if (cores >= 8) return 'high';
  if (cores >= 4) return 'medium';
  return 'low';
}

// Reduce caustics resolution on mobile
export function getOptimalCausticsResolution(): number {
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const gpuTier = detectGPUTier();

  if (gpuTier === 'high' && !isMobile) return 1024;
  if (gpuTier === 'medium') return 512;
  return 256;
}

// Optimize texture settings based on device
export interface TextureOptimizationSettings {
  anisotropy: number;
  generateMipmaps: boolean;
  format: THREE.PixelFormat;
}

export function getOptimalTextureSettings(): TextureOptimizationSettings {
  const gpuTier = detectGPUTier();
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

  if (gpuTier === 'high' && !isMobile) {
    return {
      anisotropy: 16,
      generateMipmaps: true,
      format: THREE.RGBAFormat,
    };
  }

  if (gpuTier === 'medium') {
    return {
      anisotropy: 4,
      generateMipmaps: true,
      format: THREE.RGBAFormat,
    };
  }

  // Low-end settings
  return {
    anisotropy: 1,
    generateMipmaps: false,
    format: THREE.RGBFormat, // Smaller format
  };
}

// Texture compression helpers
export async function compressTextures(textures: THREE.Texture[]): Promise<void> {
  // In production, use KTX2 compression for WebGPU
  // Use Basis Universal for WebGL fallback
  // For now, just optimize existing textures
  textures.forEach(texture => {
    const settings = getOptimalTextureSettings();
    texture.anisotropy = settings.anisotropy;
    texture.generateMipmaps = settings.generateMipmaps;
    texture.format = settings.format;
    texture.needsUpdate = true;
  });
}

// Service worker registration for asset caching
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

// Preload critical assets
export function preloadCriticalAssets(assets: string[]): void {
  assets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';

    if (asset.endsWith('.woff2') || asset.endsWith('.woff')) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    } else if (asset.endsWith('.jpg') || asset.endsWith('.png') || asset.endsWith('.webp')) {
      link.as = 'image';
    } else if (asset.endsWith('.js')) {
      link.as = 'script';
    } else if (asset.endsWith('.css')) {
      link.as = 'style';
    }

    link.href = asset;
    document.head.appendChild(link);
  });
}

// FPS monitoring and quality adjustment
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private avgFPS = 60;
  private callbacks: Array<(fps: number) => void> = [];

  start(): void {
    this.measure();
  }

  private measure = (): void => {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.avgFPS = (this.frameCount / elapsed) * 1000;
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Notify callbacks
      this.callbacks.forEach(cb => cb(this.avgFPS));
    }

    requestAnimationFrame(this.measure);
  };

  onFPSUpdate(callback: (fps: number) => void): void {
    this.callbacks.push(callback);
  }

  getAverageFPS(): number {
    return this.avgFPS;
  }
}

// Memory management for 3D scenes
export function disposeThreeJSObject(obj: THREE.Object3D): void {
  if (obj instanceof THREE.Mesh) {
    if (obj.geometry) {
      obj.geometry.dispose();
    }

    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(material => disposeMaterial(material));
      } else {
        disposeMaterial(obj.material);
      }
    }
  }

  obj.traverse(child => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(disposeMaterial);
        } else {
          disposeMaterial(child.material);
        }
      }
    }
  });
}

function disposeMaterial(material: THREE.Material): void {
  const mat = material as any;
  if ('map' in material && mat.map) mat.map.dispose();
  if ('lightMap' in material && mat.lightMap) mat.lightMap.dispose();
  if ('bumpMap' in material && mat.bumpMap) mat.bumpMap.dispose();
  if ('normalMap' in material && mat.normalMap) mat.normalMap.dispose();
  if ('specularMap' in material && mat.specularMap) mat.specularMap.dispose();
  if ('envMap' in material && mat.envMap) mat.envMap.dispose();
  material.dispose();
}

// Adaptive quality settings
export interface QualitySettings {
  shadowMapSize: number;
  particleCount: number;
  antialias: boolean;
  pixelRatio: number;
  causticResolution: number;
}

export function getAdaptiveQualitySettings(targetFPS: number, currentFPS: number): QualitySettings {
  const gpuTier = detectGPUTier();
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

  let quality: 'low' | 'medium' | 'high' = gpuTier;

  // Downgrade if FPS is low
  if (currentFPS < targetFPS * 0.7) {
    if (quality === 'high') quality = 'medium';
    else if (quality === 'medium') quality = 'low';
  }

  const settings: Record<'low' | 'medium' | 'high', QualitySettings> = {
    low: {
      shadowMapSize: 512,
      particleCount: 15,
      antialias: false,
      pixelRatio: 1,
      causticResolution: 256,
    },
    medium: {
      shadowMapSize: 1024,
      particleCount: 25,
      antialias: true,
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      causticResolution: 512,
    },
    high: {
      shadowMapSize: 2048,
      particleCount: 40,
      antialias: true,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      causticResolution: 1024,
    },
  };

  return settings[quality];
}
