/**
 * Temporal Anti-Aliasing (TAA) implementation for WebGPU
 * Reduces aliasing and stairstepping by accumulating samples across frames
 */

export interface TAAConfig {
  enabled: boolean;
  historyFrames: number; // Number of frames to accumulate (2-16)
  blendFactor: number; // Weight of current frame vs history (0-1)
  jitterPattern: 'halton' | 'random';
  velocityRejection: boolean; // Reject history based on motion vectors
}

export const TAAPresets: Record<string, TAAConfig> = {
  high: {
    enabled: true,
    historyFrames: 8,
    blendFactor: 0.05, // 5% current frame, 95% history
    jitterPattern: 'halton',
    velocityRejection: true,
  },
  medium: {
    enabled: true,
    historyFrames: 4,
    blendFactor: 0.1,
    jitterPattern: 'halton',
    velocityRejection: false,
  },
  low: {
    enabled: false,
    historyFrames: 0,
    blendFactor: 1.0,
    jitterPattern: 'random',
    velocityRejection: false,
  },
};

/**
 * Halton sequence generator for deterministic low-discrepancy sampling
 * Used for camera jitter patterns in TAA
 */
export class HaltonSequence {
  private index = 0;

  constructor(private base: number) {}

  public next(): number {
    let result = 0;
    let f = 1;
    let i = this.index;

    while (i > 0) {
      f = f / this.base;
      result = result + f * (i % this.base);
      i = Math.floor(i / this.base);
    }

    this.index++;
    return result;
  }

  public reset() {
    this.index = 0;
  }
}

/**
 * Generate jitter offset for camera based on TAA pattern
 */
export class JitterGenerator {
  private haltonX = new HaltonSequence(2);
  private haltonY = new HaltonSequence(3);
  private frameIndex = 0;

  constructor(private pattern: 'halton' | 'random' = 'halton') {}

  public getJitter(width: number, height: number): { x: number; y: number } {
    if (this.pattern === 'halton') {
      // Halton sequence centered around 0
      const x = (this.haltonX.next() - 0.5) / width;
      const y = (this.haltonY.next() - 0.5) / height;
      return { x, y };
    } else {
      // Random jitter
      const x = (Math.random() - 0.5) / width;
      const y = (Math.random() - 0.5) / height;
      return { x, y };
    }
  }

  public nextFrame() {
    this.frameIndex++;
    // Reset Halton sequence every N frames to prevent drift
    if (this.frameIndex % 16 === 0) {
      this.haltonX.reset();
      this.haltonY.reset();
    }
  }

  public reset() {
    this.frameIndex = 0;
    this.haltonX.reset();
    this.haltonY.reset();
  }
}

/**
 * TAA accumulator that manages history buffers
 */
export class TAAAccumulator {
  private historyTextures: GPUTexture[] = [];
  private currentHistoryIndex = 0;
  private config: TAAConfig;
  private jitterGenerator: JitterGenerator;

  constructor(
    private device: GPUDevice,
    private width: number,
    private height: number,
    config: TAAConfig
  ) {
    this.config = config;
    this.jitterGenerator = new JitterGenerator(config.jitterPattern);
    this.initializeHistoryBuffers();
  }

  private initializeHistoryBuffers() {
    if (!this.config.enabled) return;

    // Create history texture buffers
    for (let i = 0; i < this.config.historyFrames; i++) {
      const texture = this.device.createTexture({
        size: { width: this.width, height: this.height },
        format: 'rgba16float',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      });
      this.historyTextures.push(texture);
    }
  }

  public getJitter(): { x: number; y: number } {
    return this.jitterGenerator.getJitter(this.width, this.height);
  }

  public getCurrentHistoryTexture(): GPUTexture | null {
    if (!this.config.enabled || this.historyTextures.length === 0) {
      return null;
    }
    return this.historyTextures[this.currentHistoryIndex];
  }

  public getPreviousHistoryTexture(): GPUTexture | null {
    if (!this.config.enabled || this.historyTextures.length === 0) {
      return null;
    }
    const prevIndex = (this.currentHistoryIndex - 1 + this.historyTextures.length) % this.historyTextures.length;
    return this.historyTextures[prevIndex];
  }

  public nextFrame() {
    if (!this.config.enabled) return;

    this.jitterGenerator.nextFrame();
    this.currentHistoryIndex = (this.currentHistoryIndex + 1) % this.historyTextures.length;
  }

  public getBlendFactor(): number {
    return this.config.blendFactor;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.destroy();
    this.initializeHistoryBuffers();
  }

  public destroy() {
    this.historyTextures.forEach(tex => tex.destroy());
    this.historyTextures = [];
  }

  public reset() {
    this.currentHistoryIndex = 0;
    this.jitterGenerator.reset();
  }
}

/**
 * WGSL shader code for TAA blending
 */
export const TAAShaderCode = `
struct TAAUniforms {
  blendFactor: f32,
  velocityRejection: f32,
  frameIndex: u32,
}

@group(0) @binding(0) var currentFrame: texture_2d<f32>;
@group(0) @binding(1) var historyFrame: texture_2d<f32>;
@group(0) @binding(2) var velocityTexture: texture_2d<f32>;
@group(0) @binding(3) var<uniform> uniforms: TAAUniforms;
@group(0) @binding(4) var linearSampler: sampler;

fn rgb2ycocg(rgb: vec3f) -> vec3f {
  let y = dot(rgb, vec3f(0.25, 0.5, 0.25));
  let co = dot(rgb, vec3f(0.5, 0.0, -0.5));
  let cg = dot(rgb, vec3f(-0.25, 0.5, -0.25));
  return vec3f(y, co, cg);
}

fn ycocg2rgb(ycocg: vec3f) -> vec3f {
  let y = ycocg.x;
  let co = ycocg.y;
  let cg = ycocg.z;
  return vec3f(
    y + co - cg,
    y + cg,
    y - co - cg
  );
}

// Variance clipping to reduce ghosting
fn clipHistory(
  history: vec3f,
  current: vec3f,
  neighbors: array<vec3f, 9>
) -> vec3f {
  // Compute neighborhood statistics in YCoCg space
  var mean = vec3f(0.0);
  var m2 = vec3f(0.0);

  for (var i = 0; i < 9; i++) {
    let ycocg = rgb2ycocg(neighbors[i]);
    mean += ycocg;
    m2 += ycocg * ycocg;
  }

  mean /= 9.0;
  let variance = (m2 / 9.0) - (mean * mean);
  let stdDev = sqrt(max(variance, vec3f(0.0)));

  // Clip history to neighborhood bounding box
  let historyYCoCg = rgb2ycocg(history);
  let currentYCoCg = rgb2ycocg(current);

  let boxMin = mean - stdDev * 1.5;
  let boxMax = mean + stdDev * 1.5;

  let clipped = clamp(historyYCoCg, boxMin, boxMax);
  return ycocg2rgb(clipped);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let texSize = textureDimensions(currentFrame);
  let coord = vec2i(uv * vec2f(texSize));

  // Sample current frame
  let current = textureLoad(currentFrame, coord, 0).rgb;

  // Sample velocity
  let velocity = textureLoad(velocityTexture, coord, 0).xy;

  // Reproject history using velocity
  let historyUV = uv - velocity;

  // Check if history is valid (within bounds)
  if (historyUV.x < 0.0 || historyUV.x > 1.0 || historyUV.y < 0.0 || historyUV.y > 1.0) {
    return vec4f(current, 1.0);
  }

  // Sample history with bilinear filtering
  let history = textureSampleLevel(historyFrame, linearSampler, historyUV, 0.0).rgb;

  // Gather neighborhood for variance clipping
  var neighbors: array<vec3f, 9>;
  var idx = 0;
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      let offsetCoord = coord + vec2i(dx, dy);
      neighbors[idx] = textureLoad(currentFrame, offsetCoord, 0).rgb;
      idx++;
    }
  }

  // Clip history to reduce ghosting
  let clippedHistory = clipHistory(history, current, neighbors);

  // Blend current and history
  let blended = mix(clippedHistory, current, uniforms.blendFactor);

  return vec4f(blended, 1.0);
}
`;
