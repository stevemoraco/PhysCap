import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { GoldButton } from '@/components/GoldButton';
import { cn } from '@/lib/utils';

interface YadilhilOrbital3DProps {
  className?: string;
  ctaLabel?: string;
  onExpressInterest?: () => void;
  personalizationHint?: string;
}

export function YadilhilOrbital3D({
  className,
  ctaLabel,
  onExpressInterest,
  personalizationHint,
}: YadilhilOrbital3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { orientation, isSupported } = useDeviceOrientation();
  const orientationRef = useRef({ beta: 0, gamma: 0 });
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    animationId: number | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported for Yádiłhił orbital visualization');
      setIsLoading(false);
      setError(true);
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000814); // Deep space blue
      scene.fog = new THREE.FogExp2(0x000814, 0.015);

      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(30, 20, 30);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        failIfMajorPerformanceCaveat: false
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Space lighting
      const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
      sunLight.position.set(50, 50, 50);
      scene.add(sunLight);

      const accentLight = new THREE.PointLight(0x50c878, 0.8, 50);
      accentLight.position.set(0, 0, 0);
      scene.add(accentLight);
      const auroraLight = new THREE.PointLight(0x4a90e2, 0.5, 80);
      auroraLight.position.set(-25, 12, 20);
      scene.add(auroraLight);

      // Star field background
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.8,
      });

      const starsVertices = [];
      for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 200;
        const y = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200;
        starsVertices.push(x, y, z);
      }
      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);

      // Materials
      const stationMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37, // Gold
        roughness: 0.3,
        metalness: 0.9,
        emissive: 0xd4af37,
        emissiveIntensity: 0.2,
      });

      const habitatMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.7,
      });

      const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x4A90E2,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.7,
      });

      const solarPanelMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.4,
        metalness: 0.8,
        emissive: 0x0066cc,
        emissiveIntensity: 0.1,
      });

      // Central hub (main station core)
      const hub = new THREE.Mesh(
        new THREE.SphereGeometry(3, 32, 32),
        stationMaterial
      );
      scene.add(hub);

      // Rotating habitat rings (living quarters)
      const rings: THREE.Mesh[] = [];
      
      for (let i = 0; i < 3; i++) {
        const ringRadius = 8 + i * 4;
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(ringRadius, 0.8, 16, 32),
          habitatMaterial
        );
        ring.rotation.x = Math.PI / 2 + (i * 0.1);
        rings.push(ring);
        scene.add(ring);

        // Habitat modules on rings
        const moduleCount = 8;
        for (let j = 0; j < moduleCount; j++) {
          const angle = (j / moduleCount) * Math.PI * 2;
          const module = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.6, 1.5, 8),
            glassMaterial
          );
          module.position.set(
            Math.cos(angle) * ringRadius,
            0,
            Math.sin(angle) * ringRadius
          );
          module.rotation.z = Math.PI / 2;
          module.rotation.y = angle + Math.PI / 2;
          ring.add(module);
        }
      }

      // Docking ports (connecting spokes)
      const spokeCount = 6;
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * Math.PI * 2;
        const spoke = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 12, 8),
          stationMaterial
        );
        spoke.position.set(
          Math.cos(angle) * 6,
          0,
          Math.sin(angle) * 6
        );
        spoke.rotation.z = Math.PI / 2;
        spoke.rotation.y = angle;
        scene.add(spoke);

        // Docking module at end
        const dockingPort = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 16, 16),
          habitatMaterial
        );
        dockingPort.position.set(
          Math.cos(angle) * 12,
          0,
          Math.sin(angle) * 12
        );
        scene.add(dockingPort);
      }

      // Solar panel arrays
      const solarArrays: THREE.Group[] = [];
      for (let i = 0; i < 4; i++) {
        const array = new THREE.Group();
        const angle = (i / 4) * Math.PI * 2;
        
        // Support arm
        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.2, 15),
          stationMaterial
        );
        array.add(arm);

        // Solar panels
        for (let j = 0; j < 6; j++) {
          const panel = new THREE.Mesh(
            new THREE.BoxGeometry(2, 3, 0.1),
            solarPanelMaterial
          );
          panel.position.set((j - 2.5) * 2.5, 0, 0);
          array.add(panel);
        }

        array.position.set(
          Math.cos(angle) * 5,
          4 + i * 1.5,
          Math.sin(angle) * 5
        );
        array.rotation.y = angle;
        solarArrays.push(array);
        scene.add(array);
      }

      // Communication antenna
      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 10, 8),
        stationMaterial
      );
      antenna.position.y = 8;
      scene.add(antenna);

      const dish = new THREE.Mesh(
        new THREE.ConeGeometry(2, 1, 16),
        habitatMaterial
      );
      dish.position.y = 13;
      dish.rotation.x = Math.PI;
      scene.add(dish);

      // Observation dome (emerald accent)
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({
          color: 0x50c878,
          roughness: 0.1,
          metalness: 0.9,
          transparent: true,
          opacity: 0.6,
          emissive: 0x50c878,
          emissiveIntensity: 0.3,
        })
      );
      dome.position.y = -3;
      scene.add(dome);

      // Animation
      let time = 0;
      const animate = () => {
        time += 0.01;

        // Camera orbit
        const baseX = Math.cos(time * 0.2) * 30;
        const baseZ = Math.sin(time * 0.2) * 30;
        
        const gyroOffsetX = (orientationRef.current.gamma / 90) * 10;
        const gyroOffsetY = (orientationRef.current.beta / 180) * 6;
        
        camera.position.x = baseX + gyroOffsetX;
        camera.position.y = 20 + gyroOffsetY;
        camera.position.z = baseZ;
        camera.lookAt(0, 0, 0);

        // Rotate habitat rings (simulating artificial gravity)
        rings.forEach((ring, i) => {
          ring.rotation.z += 0.002 * (1 + i * 0.2);
        });

        // Slowly rotate solar arrays to track "sun"
        solarArrays.forEach((array, i) => {
          array.rotation.z += 0.001 * (i % 2 === 0 ? 1 : -1);
        });

        // Pulse accent light
        accentLight.intensity = 0.8 + Math.sin(time * 2) * 0.3;
        auroraLight.intensity = 0.5 + Math.cos(time * 1.6) * 0.2;

        // Rotate star field slowly
        stars.rotation.y += 0.0001;

        if (renderer) {
          renderer.render(scene, camera);
        }
        const animationId = requestAnimationFrame(animate);
        if (sceneRef.current) {
          sceneRef.current.animationId = animationId;
        }
      };

      sceneRef.current = { renderer, animationId: null };
      setIsLoading(false);
      animate();

      const handleResize = () => {
        if (!container || !renderer) return;
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (sceneRef.current?.animationId) {
          cancelAnimationFrame(sceneRef.current.animationId);
        }
        if (renderer) {
          renderer.dispose();
          if (container && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        }
      };
    } catch (err) {
      console.error('Error initializing Yádiłhił orbital visualization:', err);
      setIsLoading(false);
      setError(true);
      if (renderer) {
        renderer.dispose();
      }
    }
  }, []);

  useEffect(() => {
    if (isSupported && orientation.beta !== null && orientation.gamma !== null) {
      orientationRef.current = {
        beta: orientation.beta,
        gamma: orientation.gamma,
      };
    }
  }, [orientation, isSupported]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full", className)}
      style={{ width: '100%', height: '100%' }}
    >
      {onExpressInterest && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-4">
          <div className="pointer-events-auto rounded-xl border border-primary/20 bg-background/80 px-4 py-3 shadow-lg shadow-primary/30 backdrop-blur">
            <p className="text-xs text-primary/80">
              {personalizationHint ??
                "Orbital residences forged in Colorado, guided by your aerospace expertise."}
            </p>
            <GoldButton
              size="sm"
              icon="sparkle"
              onClick={onExpressInterest}
              className="mt-2"
              data-testid="cta-yadilhil-overlay"
            >
              {ctaLabel ?? "Join the Yádiłhił mission"}
            </GoldButton>
          </div>
        </div>
      )}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
          <div className="text-primary animate-pulse text-sm">Assembling Station...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
          <div className="text-muted-foreground text-xs">3D orbital preview unavailable</div>
        </div>
      )}
      {isSupported && !isLoading && !error && (
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded">
          Tilt to explore station
        </div>
      )}
    </div>
  );
}
