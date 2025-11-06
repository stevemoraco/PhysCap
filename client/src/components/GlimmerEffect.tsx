import { useEffect, useState } from 'react';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  speed: number;
}

interface GlimmerEffectProps {
  particleCount?: number;
  colors?: string[];
}

export function GlimmerEffect({ 
  particleCount,
  colors = ['#d4af37', '#50c878', '#b9f2ff'] // gold, emerald, diamond
}: GlimmerEffectProps) {
  const { orientation, isSupported } = useDeviceOrientation();
  const devicePerf = useDevicePerformance();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Use adaptive particle count based on device performance
  const adaptiveParticleCount = particleCount || devicePerf.maxParticles;

  // Initialize particles once on mount
  useEffect(() => {
    const particleColors = colors || ['#d4af37', '#50c878', '#b9f2ff'];
    const newParticles: Particle[] = Array.from({ length: adaptiveParticleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.5 + 0.5,
    }));
    setParticles(newParticles);
  }, [adaptiveParticleCount]); // Re-initialize if particle count changes

  // Update offset based on device orientation
  useEffect(() => {
    if (isSupported && orientation.beta !== null && orientation.gamma !== null) {
      // Convert device orientation to parallax offset
      // Gamma: left-right tilt (-90 to 90) 
      // Beta: front-back tilt (-180 to 180)
      const normalizedGamma = (orientation.gamma / 90) * 100; // -100 to 100
      const normalizedBeta = (orientation.beta / 180) * 100; // -100 to 100
      
      setOffset({
        x: normalizedGamma,
        y: normalizedBeta,
      });
    }
  }, [orientation, isSupported]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => {
        // Apply gyroscope offset to particle position
        const adjustedX = particle.x + (offset.x * particle.speed * 0.1);
        const adjustedY = particle.y + (offset.y * particle.speed * 0.1);

        return (
          <div
            key={particle.id}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${adjustedX}%`,
              top: `${adjustedY}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
              transition: 'left 0.3s ease-out, top 0.3s ease-out',
              animationDuration: `${2 + Math.random() * 2}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        );
      })}
    </div>
  );
}
