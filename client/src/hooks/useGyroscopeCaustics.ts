import { useState, useEffect, useRef } from 'react';
import { useDeviceOrientation } from './useDeviceOrientation';
import { useDevicePerformance } from './useDevicePerformance';

export interface GyroscopeCausticsData {
  lightDirection: [number, number, number];
  causticsIntensity: number;
  quality: 'low' | 'medium' | 'high';
  isGyroActive: boolean;
  smoothedBeta: number;
  smoothedGamma: number;
}

interface UseGyroscopeCausticsOptions {
  intensity?: number;
  smoothingFactor?: number; // 0-1, higher = smoother but more latency
  autoIntensity?: boolean; // Automatically adjust based on motion
}

/**
 * Hook that integrates device gyroscope with caustics lighting
 * Maps device orientation (beta/gamma) to light direction for caustics
 */
export function useGyroscopeCaustics(
  options: UseGyroscopeCausticsOptions = {}
): GyroscopeCausticsData {
  const {
    intensity = 1.5,
    smoothingFactor = 0.8,
    autoIntensity = true,
  } = options;

  const { orientation, isSupported } = useDeviceOrientation();
  const devicePerf = useDevicePerformance();

  // Smoothed orientation values
  const smoothedBetaRef = useRef(0);
  const smoothedGammaRef = useRef(0);

  // Motion velocity for auto-intensity
  const lastBetaRef = useRef(0);
  const lastGammaRef = useRef(0);
  const velocityRef = useRef(0);

  const [causticsData, setCausticsData] = useState<GyroscopeCausticsData>({
    lightDirection: [0.5, -0.5, -0.7],
    causticsIntensity: intensity,
    quality: devicePerf.quality,
    isGyroActive: false,
    smoothedBeta: 0,
    smoothedGamma: 0,
  });

  useEffect(() => {
    if (!isSupported || orientation.beta === null || orientation.gamma === null) {
      // Fallback to default animated light direction
      let animationFrame: number;
      let time = 0;

      const animate = () => {
        time += 0.01;

        // Circular motion for non-gyro devices
        const x = Math.sin(time) * 0.5;
        const z = Math.cos(time) * 0.5;
        const y = -0.5 - Math.sin(time * 0.5) * 0.2;

        setCausticsData(prev => ({
          ...prev,
          lightDirection: [x, y, z],
          isGyroActive: false,
        }));

        animationFrame = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }

    // Gyroscope is available - use device orientation
    const beta = orientation.beta; // -180 to 180 (front-to-back tilt)
    const gamma = orientation.gamma; // -90 to 90 (left-to-right tilt)

    // Apply exponential smoothing to reduce jitter
    smoothedBetaRef.current = smoothedBetaRef.current * smoothingFactor + beta * (1 - smoothingFactor);
    smoothedGammaRef.current = smoothedGammaRef.current * smoothingFactor + gamma * (1 - smoothingFactor);

    // Calculate motion velocity for auto-intensity
    const betaVel = Math.abs(beta - lastBetaRef.current);
    const gammaVel = Math.abs(gamma - lastGammaRef.current);
    const velocity = Math.sqrt(betaVel * betaVel + gammaVel * gammaVel);

    velocityRef.current = velocityRef.current * 0.9 + velocity * 0.1;

    lastBetaRef.current = beta;
    lastGammaRef.current = gamma;

    // Convert orientation to light direction vector
    // Beta: 0 = device upright, +90 = face up, -90 = face down
    // Gamma: 0 = device level, +90 = right tilt, -90 = left tilt

    const betaRad = (smoothedBetaRef.current * Math.PI) / 180;
    const gammaRad = (smoothedGammaRef.current * Math.PI) / 180;

    // Map to light direction (pointing at the scene)
    const x = Math.sin(gammaRad);
    const y = Math.sin(betaRad) - 0.3; // Offset to point slightly downward
    const z = -Math.cos(betaRad) * Math.cos(gammaRad);

    // Normalize light direction
    const length = Math.sqrt(x * x + y * y + z * z);
    const lightDirection: [number, number, number] = [
      x / length,
      y / length,
      z / length,
    ];

    // Calculate auto-intensity based on motion
    let finalIntensity = intensity;
    if (autoIntensity) {
      // Increase intensity during motion for dramatic effect
      const motionBoost = Math.min(velocityRef.current * 0.5, 1.0);
      finalIntensity = intensity * (1.0 + motionBoost * 0.5);
    }

    setCausticsData({
      lightDirection,
      causticsIntensity: finalIntensity,
      quality: devicePerf.quality,
      isGyroActive: true,
      smoothedBeta: smoothedBetaRef.current,
      smoothedGamma: smoothedGammaRef.current,
    });
  }, [orientation, isSupported, intensity, smoothingFactor, autoIntensity, devicePerf.quality]);

  return causticsData;
}

/**
 * Calculate light direction from Euler angles
 * Useful for testing and debugging without gyroscope
 */
export function calculateLightDirection(
  beta: number,
  gamma: number
): [number, number, number] {
  const betaRad = (beta * Math.PI) / 180;
  const gammaRad = (gamma * Math.PI) / 180;

  const x = Math.sin(gammaRad);
  const y = Math.sin(betaRad) - 0.3;
  const z = -Math.cos(betaRad) * Math.cos(gammaRad);

  const length = Math.sqrt(x * x + y * y + z * z);

  return [x / length, y / length, z / length];
}

/**
 * Interpolate between two light directions
 * Used for smooth transitions in baked caustics
 */
export function interpolateLightDirection(
  dir1: [number, number, number],
  dir2: [number, number, number],
  t: number
): [number, number, number] {
  const x = dir1[0] * (1 - t) + dir2[0] * t;
  const y = dir1[1] * (1 - t) + dir2[1] * t;
  const z = dir1[2] * (1 - t) + dir2[2] * t;

  const length = Math.sqrt(x * x + y * y + z * z);

  return [x / length, y / length, z / length];
}
