// Material library for WebGPU rendering
// TypeGPU types are used at runtime, not in type definitions

export interface PBRMaterial {
  baseColor: [number, number, number];
  metalness: number;
  roughness: number;
  f0?: [number, number, number]; // Fresnel reflectance at 0 degrees
  emissive?: [number, number, number];
  emissiveIntensity?: number;
}

export interface TransmissiveMaterial {
  baseColor: [number, number, number];
  ior: number; // Index of refraction
  transmission: number;
  thickness?: number;
  dispersion?: number; // Chromatic aberration
  absorption?: [number, number, number]; // Beer-Lambert absorption
  subsurfaceScatter?: number;
  antiReflective?: boolean;
}

export interface FogMaterial {
  color: number;
  density: number;
  exponent: number;
}

// Convert hex color to normalized RGB
function hexToRGB(hex: number): [number, number, number] {
  const r = ((hex >> 16) & 255) / 255;
  const g = ((hex >> 8) & 255) / 255;
  const b = (hex & 255) / 255;
  return [r, g, b];
}

// Physically-based materials library for solar manufacturing
export const Materials = {
  // Gold - for robotic arms and luxury accents
  gold: {
    baseColor: hexToRGB(0xd4af37),
    metalness: 0.95,
    roughness: 0.15,
    f0: [1.022, 0.782, 0.344], // Real gold reflectance at normal incidence
    emissive: hexToRGB(0xd4af37),
    emissiveIntensity: 0.1,
  } as PBRMaterial,

  // Diamond - for cutting tools and precision components
  diamond: {
    baseColor: [1.0, 1.0, 1.0],
    ior: 2.417,
    transmission: 0.95,
    dispersion: 0.044, // Strong chromatic aberration for rainbow caustics
    subsurfaceScatter: 0.1,
  } as TransmissiveMaterial,

  // Emerald - accent lighting and visual interest
  emerald: {
    baseColor: hexToRGB(0x50c878),
    ior: 1.58,
    transmission: 0.7,
    absorption: [1.0, 0.3, 0.4], // Green passes through, red/blue absorbed
    subsurfaceScatter: 0.6,
  } as TransmissiveMaterial,

  // Solar glass - anti-reflective coating
  solarGlass: {
    baseColor: [0.98, 0.98, 1.0],
    ior: 1.52,
    transmission: 0.92,
    thickness: 0.003, // 3mm
    antiReflective: true, // Simulates AR coating
  } as TransmissiveMaterial,

  // Silicon wafer - semiconductor material
  siliconWafer: {
    baseColor: hexToRGB(0x1a3c5a),
    metalness: 0.3,
    roughness: 0.4,
    emissive: hexToRGB(0x0a1f2e),
    emissiveIntensity: 0.2,
  } as PBRMaterial,

  // Molten silicon - glowing liquid
  moltenSilicon: {
    baseColor: hexToRGB(0xff6b35),
    metalness: 0.8,
    roughness: 0.3,
    emissive: hexToRGB(0xff6b35),
    emissiveIntensity: 2.5,
  } as PBRMaterial,

  // Metal frame - aluminum
  metalFrame: {
    baseColor: hexToRGB(0x2a2a2a),
    metalness: 0.9,
    roughness: 0.1,
  } as PBRMaterial,

  // Factory floor
  factoryFloor: {
    baseColor: hexToRGB(0x0f3d3a),
    metalness: 0.2,
    roughness: 0.8,
  } as PBRMaterial,

  // Background fog/atmosphere
  darkBlueGreen: {
    color: 0x0a2e2c,
    density: 0.02,
    exponent: 2.0,
  } as FogMaterial,
};

// Shader constants for materials
export const MaterialConstants = {
  // Fresnel-Schlick approximation constants
  FRESNEL_MIN: 0.04, // Dielectric base reflectance

  // Beer-Lambert law constants
  BEER_LAMBERT_SCALE: 5.0,

  // Subsurface scattering
  SSS_DISTORTION: 0.5,
  SSS_POWER: 4.0,
  SSS_SCALE: 2.0,

  // Anti-reflective coating simulation
  AR_COATING_REDUCTION: 0.75, // 75% reduction in reflection
};

// Helper function to calculate Fresnel reflectance
export function fresnelSchlick(cosTheta: number, f0: [number, number, number]): [number, number, number] {
  const f = 1.0 - cosTheta;
  const f2 = f * f;
  const f5 = f2 * f2 * f;

  return [
    f0[0] + (1.0 - f0[0]) * f5,
    f0[1] + (1.0 - f0[1]) * f5,
    f0[2] + (1.0 - f0[2]) * f5,
  ];
}

// Helper function to calculate Beer-Lambert absorption
export function beerLambertAbsorption(
  distance: number,
  absorption: [number, number, number]
): [number, number, number] {
  return [
    Math.exp(-absorption[0] * distance * MaterialConstants.BEER_LAMBERT_SCALE),
    Math.exp(-absorption[1] * distance * MaterialConstants.BEER_LAMBERT_SCALE),
    Math.exp(-absorption[2] * distance * MaterialConstants.BEER_LAMBERT_SCALE),
  ];
}

// Material IDs for shader lookup
export enum MaterialID {
  Gold = 0,
  Diamond = 1,
  Emerald = 2,
  SolarGlass = 3,
  SiliconWafer = 4,
  MoltenSilicon = 5,
  MetalFrame = 6,
  FactoryFloor = 7,
}

// Pack material data into shader-friendly format
export interface MaterialUniform {
  baseColor: Float32Array; // vec3
  metalness: number;
  roughness: number;
  f0: Float32Array; // vec3
  emissive: Float32Array; // vec3
  emissiveIntensity: number;
  ior: number;
  transmission: number;
  dispersion: number;
  absorption: Float32Array; // vec3
  subsurfaceScatter: number;
  antiReflective: number; // boolean as float
}

export function packMaterialUniform(material: PBRMaterial | TransmissiveMaterial): MaterialUniform {
  const isPBR = 'metalness' in material;

  if (isPBR) {
    const pbr = material as PBRMaterial;
    return {
      baseColor: new Float32Array(pbr.baseColor),
      metalness: pbr.metalness,
      roughness: pbr.roughness,
      f0: new Float32Array(pbr.f0 || [0.04, 0.04, 0.04]),
      emissive: new Float32Array(pbr.emissive || [0, 0, 0]),
      emissiveIntensity: pbr.emissiveIntensity || 0,
      ior: 1.0,
      transmission: 0,
      dispersion: 0,
      absorption: new Float32Array([0, 0, 0]),
      subsurfaceScatter: 0,
      antiReflective: 0,
    };
  } else {
    const trans = material as TransmissiveMaterial;
    return {
      baseColor: new Float32Array(trans.baseColor),
      metalness: 0,
      roughness: 0.01,
      f0: new Float32Array([0.04, 0.04, 0.04]),
      emissive: new Float32Array([0, 0, 0]),
      emissiveIntensity: 0,
      ior: trans.ior,
      transmission: trans.transmission,
      dispersion: trans.dispersion || 0,
      absorption: new Float32Array(trans.absorption || [0, 0, 0]),
      subsurfaceScatter: trans.subsurfaceScatter || 0,
      antiReflective: trans.antiReflective ? 1.0 : 0.0,
    };
  }
}
