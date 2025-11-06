export interface QualityPreset {
  name: 'low' | 'medium' | 'high';
  causticsResolution: number;
  useTAA: boolean;
  taaHistory: number;
  rayMarchSteps: number;
  shadowSteps: number;
  targetFPS: number;
  pixelRatio: number;
  subsurfaceEnabled: boolean;
  refractionBounces: number;
}

export const QualityPresets: Record<string, QualityPreset> = {
  high: {
    name: 'high',
    causticsResolution: 1024,
    useTAA: true,
    taaHistory: 8,
    rayMarchSteps: 128,
    shadowSteps: 32,
    targetFPS: 60,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    subsurfaceEnabled: true,
    refractionBounces: 3,
  },
  medium: {
    name: 'medium',
    causticsResolution: 512,
    useTAA: true,
    taaHistory: 4,
    rayMarchSteps: 64,
    shadowSteps: 16,
    targetFPS: 30,
    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    subsurfaceEnabled: true,
    refractionBounces: 2,
  },
  low: {
    name: 'low',
    causticsResolution: 256,
    useTAA: false,
    taaHistory: 0,
    rayMarchSteps: 32,
    shadowSteps: 8,
    targetFPS: 30,
    pixelRatio: 1,
    subsurfaceEnabled: false,
    refractionBounces: 1,
  },
};

export interface PerformanceMetrics {
  fps: number;
  frameTime: number; // ms
  renderTime: number; // ms
  gpuTime: number; // ms
  memoryUsage: number; // MB
}

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fpsHistory: number[] = [];
  private currentQuality: QualityPreset;
  private readonly maxHistoryLength = 60; // 1 second at 60fps
  private readonly downgradeThreshold = 0.7; // 70% of target FPS
  private readonly upgradeThreshold = 1.2; // 120% of target FPS
  private readonly upgradeDelay = 5000; // Wait 5 seconds before upgrading
  private lastQualityChange = 0;
  private gpuTier: 'high' | 'medium' | 'low';

  constructor(initialQuality: 'low' | 'medium' | 'high', gpuTier: 'high' | 'medium' | 'low') {
    this.currentQuality = QualityPresets[initialQuality];
    this.gpuTier = gpuTier;
  }

  public getQuality(): QualityPreset {
    return this.currentQuality;
  }

  public recordFrame(): PerformanceMetrics {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    // Calculate FPS
    const fps = 1000 / deltaTime;
    this.fpsHistory.push(fps);

    // Keep history size manageable
    if (this.fpsHistory.length > this.maxHistoryLength) {
      this.fpsHistory.shift();
    }

    this.lastTime = currentTime;

    // Estimate memory usage (approximate)
    const memoryUsage = (performance as any).memory
      ? (performance as any).memory.usedJSHeapSize / (1024 * 1024)
      : 0;

    return {
      fps,
      frameTime: deltaTime,
      renderTime: deltaTime, // Simplified - would need query sets for accurate GPU time
      gpuTime: deltaTime * 0.8, // Estimate GPU is 80% of frame time
      memoryUsage,
    };
  }

  public shouldAdjustQuality(): { shouldChange: boolean; newQuality: QualityPreset | null } {
    // Need enough samples to make a decision
    if (this.fpsHistory.length < 30) {
      return { shouldChange: false, newQuality: null };
    }

    // Calculate average FPS over recent history
    const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    const targetFPS = this.currentQuality.targetFPS;

    // Prevent rapid quality changes
    const timeSinceLastChange = performance.now() - this.lastQualityChange;
    if (timeSinceLastChange < this.upgradeDelay) {
      return { shouldChange: false, newQuality: null };
    }

    // Check if we should downgrade
    if (avgFPS < targetFPS * this.downgradeThreshold) {
      const newQuality = this.downgradeQuality();
      if (newQuality) {
        this.lastQualityChange = performance.now();
        this.fpsHistory = []; // Reset history
        return { shouldChange: true, newQuality };
      }
    }

    // Check if we can upgrade
    if (avgFPS > targetFPS * this.upgradeThreshold) {
      const newQuality = this.upgradeQuality();
      if (newQuality) {
        this.lastQualityChange = performance.now();
        this.fpsHistory = []; // Reset history
        return { shouldChange: true, newQuality };
      }
    }

    return { shouldChange: false, newQuality: null };
  }

  private downgradeQuality(): QualityPreset | null {
    if (this.currentQuality.name === 'high') {
      this.currentQuality = QualityPresets.medium;
      return this.currentQuality;
    } else if (this.currentQuality.name === 'medium') {
      this.currentQuality = QualityPresets.low;
      return this.currentQuality;
    }
    return null; // Already at lowest quality
  }

  private upgradeQuality(): QualityPreset | null {
    // Only upgrade if GPU tier supports it
    if (this.currentQuality.name === 'low' && this.gpuTier !== 'low') {
      this.currentQuality = QualityPresets.medium;
      return this.currentQuality;
    } else if (this.currentQuality.name === 'medium' && this.gpuTier === 'high') {
      this.currentQuality = QualityPresets.high;
      return this.currentQuality;
    }
    return null; // Already at max quality for this GPU
  }

  public getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  public reset() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
  }
}

// Detect GPU tier from adapter info
export function detectGPUTier(vendor: string, architecture: string): 'high' | 'medium' | 'low' {
  const vendorLower = vendor.toLowerCase();
  const archLower = architecture.toLowerCase();

  // High-end discrete GPUs
  if (
    vendorLower.includes('nvidia') ||
    (vendorLower.includes('amd') && archLower.includes('discrete')) ||
    archLower.includes('discrete')
  ) {
    return 'high';
  }

  // Mobile/integrated GPUs
  if (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    archLower.includes('integrated') ||
    archLower.includes('mobile')
  ) {
    return 'low';
  }

  // Default to medium
  return 'medium';
}

// Progressive loading system
export interface LoadingStage {
  name: string;
  progress: number; // 0-1
  description: string;
}

export class ProgressiveLoader {
  private stages: LoadingStage[] = [
    { name: 'init', progress: 0, description: 'Initializing WebGPU' },
    { name: 'shaders', progress: 0, description: 'Compiling shaders' },
    { name: 'textures', progress: 0, description: 'Loading textures' },
    { name: 'geometry', progress: 0, description: 'Building geometry' },
    { name: 'caustics', progress: 0, description: 'Computing caustics' },
    { name: 'ready', progress: 0, description: 'Ready' },
  ];

  private currentStageIndex = 0;
  private startTime = performance.now();

  public getCurrentStage(): LoadingStage {
    return this.stages[this.currentStageIndex];
  }

  public getTotalProgress(): number {
    const baseProgress = this.currentStageIndex / this.stages.length;
    const stageProgress = this.stages[this.currentStageIndex].progress / this.stages.length;
    return baseProgress + stageProgress;
  }

  public updateProgress(progress: number) {
    this.stages[this.currentStageIndex].progress = Math.min(1, Math.max(0, progress));
  }

  public nextStage() {
    if (this.currentStageIndex < this.stages.length - 1) {
      this.currentStageIndex++;
      this.stages[this.currentStageIndex].progress = 0;
    }
  }

  public getLoadTime(): number {
    return performance.now() - this.startTime;
  }

  public isComplete(): boolean {
    return this.currentStageIndex === this.stages.length - 1 &&
           this.stages[this.currentStageIndex].progress === 1;
  }
}

// Frame budget system
export class FrameBudget {
  private readonly targetFrameTime: number; // ms
  private readonly budgetPhases = {
    update: 0.2,     // 20% for update logic
    rayMarch: 0.5,   // 50% for ray marching
    caustics: 0.15,  // 15% for caustics
    postProcess: 0.1, // 10% for post-processing
    present: 0.05,   // 5% for presentation
  };

  constructor(targetFPS: number) {
    this.targetFrameTime = 1000 / targetFPS;
  }

  public getPhaseBudget(phase: keyof typeof this.budgetPhases): number {
    return this.targetFrameTime * this.budgetPhases[phase];
  }

  public getTotalBudget(): number {
    return this.targetFrameTime;
  }

  public hasTimeRemaining(elapsed: number): boolean {
    return elapsed < this.targetFrameTime;
  }
}
