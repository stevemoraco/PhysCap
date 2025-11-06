import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { GoldButton } from '@/components/GoldButton';
import { cn } from '@/lib/utils';

interface VenustasTower3DProps {
  className?: string;
  ctaLabel?: string;
  onExpressInterest?: () => void;
  personalizationHint?: string;
}

export function VenustasTower3D({
  className,
  ctaLabel,
  onExpressInterest,
  personalizationHint,
}: VenustasTower3DProps) {
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
      console.warn('WebGL not supported for Venustas Tower visualization');
      setIsLoading(false);
      setError(true);
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x87CEEB);
      scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(40, 60, 40);
      camera.lookAt(0, 30, 0);

      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        failIfMajorPerformanceCaveat: false
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffd700, 1.5);
      sunLight.position.set(50, 100, 30);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      scene.add(sunLight);

      const accentLight = new THREE.PointLight(0x50c878, 0.6, 100);
      accentLight.position.set(-20, 50, -20);
      scene.add(accentLight);
      const rimLight = new THREE.PointLight(0x87ceeb, 0.35, 80);
      rimLight.position.set(18, 35, -18);
      scene.add(rimLight);

      // Tower materials
      const towerMaterial = new THREE.MeshStandardMaterial({
        color: 0x303030, // Dark gray glass/steel
        roughness: 0.2,
        metalness: 0.8,
      });

      const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x87CEEB,
        roughness: 0.05,
        metalness: 0.95,
        transparent: true,
        opacity: 0.6,
      });

      const goldAccentMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.2,
        metalness: 0.9,
        emissive: 0xd4af37,
        emissiveIntensity: 0.3,
      });

      const gardenMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.9,
      });

      // Main tower (world's tallest - 100 floors represented)
      const towerGroup = new THREE.Group();

      // Tower core (tapered design)
      const segments = 20;
      for (let i = 0; i < segments; i++) {
        const height = 4;
        const y = i * height;
        const scale = 1 - (i / segments) * 0.3; // Taper to 70% at top
        
        const segment = new THREE.Mesh(
          new THREE.BoxGeometry(6 * scale, height, 6 * scale),
          i % 3 === 0 ? glassMaterial : towerMaterial
        );
        segment.position.y = y + height / 2;
        segment.castShadow = true;
        towerGroup.add(segment);
      }

      // Golden spire at top
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(2, 8, 8),
        goldAccentMaterial
      );
      spire.position.y = segments * 4 + 4;
      spire.castShadow = true;
      towerGroup.add(spire);

      // Exterior spiral staircase (key feature!)
      const stairGroup = new THREE.Group();
      const stairSteps = 50;
      const stairRadius = 7;
      
      for (let i = 0; i < stairSteps; i++) {
        const angle = (i / stairSteps) * Math.PI * 8; // 4 full rotations
        const stepHeight = (segments * 4) / stairSteps;
        const y = i * stepHeight;
        
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.2, 0.8),
          goldAccentMaterial
        );
        step.position.set(
          Math.cos(angle) * stairRadius,
          y,
          Math.sin(angle) * stairRadius
        );
        step.rotation.y = angle + Math.PI / 2;
        step.castShadow = true;
        stairGroup.add(step);

        // Railings
        if (i % 2 === 0) {
          const railing = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 1, 8),
            goldAccentMaterial
          );
          railing.position.set(
            Math.cos(angle) * (stairRadius + 0.5),
            y + 0.5,
            Math.sin(angle) * (stairRadius + 0.5)
          );
          stairGroup.add(railing);
        }
      }
      towerGroup.add(stairGroup);

      // Hanging gardens at various levels
      const gardenLevels = [20, 40, 60];
      gardenLevels.forEach(level => {
        const gardenRing = new THREE.Mesh(
          new THREE.TorusGeometry(8, 0.5, 8, 16),
          gardenMaterial
        );
        gardenRing.position.y = level;
        gardenRing.rotation.x = Math.PI / 2;
        towerGroup.add(gardenRing);

        // Add small trees on gardens
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const tree = new THREE.Mesh(
            new THREE.ConeGeometry(0.4, 1.5, 6),
            new THREE.MeshStandardMaterial({ color: 0x0F4D0F })
          );
          tree.position.set(
            Math.cos(angle) * 8,
            level + 0.75,
            Math.sin(angle) * 8
          );
          towerGroup.add(tree);
        }
      });

      scene.add(towerGroup);

      // Base platform
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(12, 14, 2, 8),
        towerMaterial
      );
      base.position.y = -1;
      base.receiveShadow = true;
      scene.add(base);

      // Ground
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(50, 32),
        new THREE.MeshStandardMaterial({ color: 0x404040, roughness: 0.8 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Animation
      let time = 0;
      const animate = () => {
        time += 0.008;

        const baseX = Math.cos(time * 0.3) * 40;
        const baseZ = Math.sin(time * 0.3) * 40;
        
        const gyroOffsetX = (orientationRef.current.gamma / 90) * 10;
        const gyroOffsetY = (orientationRef.current.beta / 180) * 8;
        
        camera.position.x = baseX + gyroOffsetX;
        camera.position.y = 60 + gyroOffsetY;
        camera.position.z = baseZ;
        camera.lookAt(0, 40, 0);

        // Subtle tower sway
        towerGroup.rotation.y = Math.sin(time * 0.5) * 0.01;

      // Animate accent light
      accentLight.intensity = 0.6 + Math.sin(time * 3) * 0.2;
      rimLight.intensity = 0.35 + Math.cos(time * 2.2) * 0.15;

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
      console.error('Error initializing Venustas Tower visualization:', err);
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
          <div className="pointer-events-auto rounded-xl border border-primary/20 bg-background/80 px-4 py-3 shadow-lg shadow-primary/20 backdrop-blur">
            <p className="text-xs text-primary/80">
              {personalizationHint ??
                "Sky gardens, glass heliports, and year-round tourism revenue—anchor the Venustas story with us."}
            </p>
            <GoldButton
              size="sm"
              icon="sparkle"
              onClick={onExpressInterest}
              className="mt-2"
              data-testid="cta-venustas-overlay"
            >
              {ctaLabel ?? "Champion Venustas Tower"}
            </GoldButton>
          </div>
        </div>
      )}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
          <div className="text-primary animate-pulse text-sm">Constructing Tower...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
          <div className="text-muted-foreground text-xs">3D tower preview unavailable</div>
        </div>
      )}
      {isSupported && !isLoading && !error && (
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded">
          Tilt to explore tower
        </div>
      )}
    </div>
  );
}
