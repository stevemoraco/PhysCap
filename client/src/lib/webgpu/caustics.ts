/**
 * Caustics rendering system for WebGPU
 * Implements photon mapping and light refraction through transparent materials
 */

export interface CausticsConfig {
  resolution: number;
  intensity: number;
  photonCount: number;
  dispersion: boolean; // Chromatic aberration
  animated: boolean;
  bakingGrid?: { x: number; y: number; z: number }; // Pre-baked caustics grid for mobile
}

export const CausticsPresets: Record<string, CausticsConfig> = {
  high: {
    resolution: 1024,
    intensity: 1.5,
    photonCount: 10000,
    dispersion: true,
    animated: true,
  },
  medium: {
    resolution: 512,
    intensity: 1.2,
    photonCount: 5000,
    dispersion: true,
    animated: true,
  },
  low: {
    resolution: 256,
    intensity: 1.0,
    photonCount: 2000,
    dispersion: false,
    animated: false,
    bakingGrid: { x: 8, y: 8, z: 8 }, // Pre-bake at discrete orientations
  },
};

/**
 * WGSL shader for caustics photon tracing
 */
export const CausticsPhotonShader = `
struct Uniforms {
  lightDir: vec3f,
  lightIntensity: f32,
  time: f32,
  dispersion: f32,
  ior: f32,
  photonCount: u32,
}

struct Photon {
  position: vec3f,
  direction: vec3f,
  color: vec3f,
  intensity: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read_write> photons: array<Photon>;
@group(0) @binding(2) var causticsTexture: texture_storage_2d<rgba16float, write>;

// Simple hash function for random numbers
fn hash(p: vec2f) -> f32 {
  let p3 = fract(vec3f(p.xyx) * 0.1031);
  let p4 = p3 + dot(p3, p3.yzx + 33.33);
  return fract((p4.x + p4.y) * p4.z);
}

// Refract ray through surface with given IOR
fn refract_ray(incident: vec3f, normal: vec3f, ior: f32) -> vec3f {
  let cosi = dot(-incident, normal);
  let eta = 1.0 / ior;
  let k = 1.0 - eta * eta * (1.0 - cosi * cosi);

  if (k < 0.0) {
    // Total internal reflection
    return reflect(incident, normal);
  }

  return eta * incident + (eta * cosi - sqrt(k)) * normal;
}

// Fresnel reflection coefficient (Schlick approximation)
fn fresnel(cosTheta: f32, ior: f32) -> f32 {
  let r0 = pow((1.0 - ior) / (1.0 + ior), 2.0);
  return r0 + (1.0 - r0) * pow(1.0 - cosTheta, 5.0);
}

// SDF for solar panel glass (box shape)
fn sdf_glass_panel(p: vec3f, size: vec3f) -> f32 {
  let q = abs(p) - size;
  return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Normal calculation from SDF
fn calc_normal(p: vec3f, size: vec3f) -> vec3f {
  let eps = 0.001;
  let h = vec2f(eps, 0.0);
  return normalize(vec3f(
    sdf_glass_panel(p + h.xyy, size) - sdf_glass_panel(p - h.xyy, size),
    sdf_glass_panel(p + h.yxy, size) - sdf_glass_panel(p - h.yxy, size),
    sdf_glass_panel(p + h.yyx, size) - sdf_glass_panel(p - h.yyx, size)
  ));
}

@compute @workgroup_size(64)
fn trace_photons(@builtin(global_invocation_id) global_id: vec3u) {
  let photon_id = global_id.x;
  if (photon_id >= uniforms.photonCount) {
    return;
  }

  // Initialize photon from light source
  let random_offset = hash(vec2f(f32(photon_id), uniforms.time));
  let photon_start = uniforms.lightDir * 10.0 + vec3f(
    (random_offset - 0.5) * 5.0,
    0.0,
    (hash(vec2f(f32(photon_id + 1u), uniforms.time)) - 0.5) * 5.0
  );

  var photon: Photon;
  photon.position = photon_start;
  photon.direction = normalize(-uniforms.lightDir);
  photon.intensity = uniforms.lightIntensity;

  // Wavelength-dependent IOR for dispersion
  let wavelength_offset = (random_offset - 0.5) * uniforms.dispersion;
  let photon_ior = uniforms.ior + wavelength_offset;

  // Map wavelength to RGB color
  if (wavelength_offset < -0.015) {
    photon.color = vec3f(0.4, 0.2, 1.0); // Blue
  } else if (wavelength_offset > 0.015) {
    photon.color = vec3f(1.0, 0.2, 0.2); // Red
  } else {
    photon.color = vec3f(0.2, 1.0, 0.4); // Green
  }

  // Ray march to find glass intersection
  let panel_size = vec3f(2.0, 0.05, 1.0);
  var t = 0.0;
  var hit = false;

  for (var i = 0; i < 64; i++) {
    let p = photon.position + photon.direction * t;
    let d = sdf_glass_panel(p, panel_size);

    if (d < 0.001) {
      hit = true;
      photon.position = p;
      break;
    }

    t += d;
    if (t > 20.0) {
      break;
    }
  }

  if (!hit) {
    return;
  }

  // Calculate refraction through glass
  let normal = calc_normal(photon.position, panel_size);
  let refracted = refract_ray(photon.direction, normal, photon_ior);

  // Fresnel attenuation
  let cos_theta = abs(dot(photon.direction, normal));
  let reflectance = fresnel(cos_theta, photon_ior);
  photon.intensity *= (1.0 - reflectance);

  // March through glass and exit
  photon.direction = refracted;
  t = 0.0;

  for (var i = 0; i < 32; i++) {
    let p = photon.position + photon.direction * t;
    let d = -sdf_glass_panel(p, panel_size); // Negative for inside

    if (d < 0.001) {
      photon.position = p;
      break;
    }

    t += abs(d);
  }

  // Refract at exit surface
  let exit_normal = -calc_normal(photon.position, panel_size);
  photon.direction = refract_ray(photon.direction, exit_normal, 1.0 / photon_ior);

  // Project photon onto caustics plane
  let plane_y = -2.0; // Factory floor
  let t_plane = (plane_y - photon.position.y) / photon.direction.y;

  if (t_plane > 0.0) {
    let hit_pos = photon.position + photon.direction * t_plane;

    // Convert to texture coordinates
    let tex_size = vec2f(textureDimensions(causticsTexture));
    let uv = (hit_pos.xz + vec2f(5.0)) / 10.0; // Map -5 to 5 range to 0-1
    let coord = vec2i(uv * tex_size);

    // Accumulate photon contribution
    if (coord.x >= 0 && coord.x < i32(tex_size.x) && coord.y >= 0 && coord.y < i32(tex_size.y)) {
      let color = photon.color * photon.intensity * 0.1;
      textureStore(causticsTexture, coord, vec4f(color, 1.0));
    }
  }

  // Store photon data
  photons[photon_id] = photon;
}
`;

/**
 * WGSL shader for applying caustics to scene
 */
export const CausticsApplyShader = `
@group(0) @binding(0) var causticsTexture: texture_2d<f32>;
@group(0) @binding(1) var causticsFilter: sampler;
@group(0) @binding(2) var<uniform> intensity: f32;

@fragment
fn apply_caustics(
  @location(0) uv: vec2f,
  @location(1) worldPos: vec3f
) -> @location(0) vec4f {
  // Map world position to caustics UV
  let causticsUV = (worldPos.xz + vec2f(5.0)) / 10.0;

  // Sample caustics texture with filtering
  let caustics = textureSample(causticsTexture, causticsFilter, causticsUV).rgb;

  // Apply intensity and color grading
  let final = caustics * intensity;

  return vec4f(final, 1.0);
}
`;

/**
 * Caustics renderer class
 */
export class CausticsRenderer {
  private photonBuffer: GPUBuffer;
  private causticsTexture: GPUTexture;
  private computePipeline: GPUComputePipeline | null = null;
  private config: CausticsConfig;
  private bakedCaustics: Map<string, GPUTexture> = new Map();

  constructor(
    private device: GPUDevice,
    config: CausticsConfig
  ) {
    this.config = config;

    // Create photon buffer
    const photonSize = 32; // vec3f pos, vec3f dir, vec3f color, f32 intensity
    this.photonBuffer = device.createBuffer({
      size: config.photonCount * photonSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // Create caustics texture
    this.causticsTexture = device.createTexture({
      size: { width: config.resolution, height: config.resolution },
      format: 'rgba16float',
      usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
  }

  public async initialize(shaderModule: GPUShaderModule) {
    // Create compute pipeline for photon tracing
    this.computePipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'trace_photons',
      },
    });
  }

  public render(
    commandEncoder: GPUCommandEncoder,
    uniforms: {
      lightDir: [number, number, number];
      lightIntensity: number;
      time: number;
      ior: number;
    }
  ) {
    if (!this.computePipeline) return;

    // Clear caustics texture
    commandEncoder.clearBuffer(this.photonBuffer);

    // Dispatch photon tracing compute shader
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this.computePipeline);

    // Bind uniforms and buffers
    // Note: Actual bind group setup would be done here

    const workgroupCount = Math.ceil(this.config.photonCount / 64);
    passEncoder.dispatchWorkgroups(workgroupCount);
    passEncoder.end();
  }

  public getCausticsTexture(): GPUTexture {
    return this.causticsTexture;
  }

  public destroy() {
    this.photonBuffer.destroy();
    this.causticsTexture.destroy();
    this.bakedCaustics.forEach(tex => tex.destroy());
  }

  // Pre-bake caustics for mobile devices
  public async bakeCausticsGrid(
    grid: { x: number; y: number; z: number },
    progressCallback?: (progress: number) => void
  ): Promise<void> {
    if (!this.config.bakingGrid) return;

    const totalSteps = grid.x * grid.y * grid.z;
    let currentStep = 0;

    for (let x = 0; x < grid.x; x++) {
      for (let y = 0; y < grid.y; y++) {
        for (let z = 0; z < grid.z; z++) {
          // Calculate light direction for this grid cell
          const beta = (y / grid.y) * Math.PI - Math.PI / 2;
          const gamma = (x / grid.x) * Math.PI - Math.PI / 2;

          const lightDir: [number, number, number] = [
            Math.sin(gamma),
            Math.sin(beta),
            -Math.cos(beta) * Math.cos(gamma),
          ];

          // Render caustics for this orientation
          const commandEncoder = this.device.createCommandEncoder();
          this.render(commandEncoder, {
            lightDir,
            lightIntensity: 1.0,
            time: 0,
            ior: 1.52,
          });
          this.device.queue.submit([commandEncoder.finish()]);

          // Store baked texture
          const key = `${x}_${y}_${z}`;
          // Copy texture for this orientation
          // Implementation would involve texture copying

          currentStep++;
          if (progressCallback) {
            progressCallback(currentStep / totalSteps);
          }
        }
      }
    }
  }

  // Get nearest baked caustics for given orientation
  public getBakedCaustics(beta: number, gamma: number): GPUTexture | null {
    if (!this.config.bakingGrid) return null;

    const grid = this.config.bakingGrid;

    // Convert orientation to grid indices
    const x = Math.floor(((gamma + Math.PI / 2) / Math.PI) * grid.x);
    const y = Math.floor(((beta + Math.PI / 2) / Math.PI) * grid.y);
    const z = 0;

    const key = `${x}_${y}_${z}`;
    return this.bakedCaustics.get(key) || null;
  }
}
