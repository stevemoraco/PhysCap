import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface Project3DPlaceholderProps {
  projectType: 'resort' | 'tower' | 'orbital';
  className?: string;
}

export function Project3DPlaceholder({ projectType, className }: Project3DPlaceholderProps) {
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

    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported, skipping 3D visualization');
      setIsLoading(false);
      setError(true);
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;

    try {
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a2e2c);
      scene.fog = new THREE.Fog(0x0a2e2c, 10, 50);

      // Camera
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(8, 6, 8);
      camera.lookAt(0, 0, 0);

      // Renderer
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        failIfMajorPerformanceCaveat: false
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xd4af37, 0.8);
      mainLight.position.set(5, 10, 5);
      scene.add(mainLight);

      const accentLight = new THREE.PointLight(0x50c878, 0.5, 30);
      accentLight.position.set(-5, 5, -5);
      scene.add(accentLight);

      // Create project-specific geometry
      const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xd4af37,
        emissiveIntensity: 0.1,
      });

      const emeraldMaterial = new THREE.MeshStandardMaterial({
        color: 0x50c878,
        metalness: 0.6,
        roughness: 0.3,
      });

      let mainObject: THREE.Object3D;

      if (projectType === 'resort') {
        const group = new THREE.Group();
        for (let i = 0; i < 5; i++) {
          const buildingGeometry = new THREE.BoxGeometry(1, 1 + Math.random(), 1);
          const building = new THREE.Mesh(buildingGeometry, goldMaterial);
          building.position.set((i - 2) * 2, 0.5, Math.random() * 2 - 1);
          group.add(building);
        }
        mainObject = group;
      } else if (projectType === 'tower') {
        const group = new THREE.Group();
        const towerGeometry = new THREE.CylinderGeometry(0.8, 1, 10, 8);
        const tower = new THREE.Mesh(towerGeometry, goldMaterial);
        tower.position.y = 5;
        group.add(tower);
        
        const spireGeometry = new THREE.ConeGeometry(0.8, 2, 8);
        const spire = new THREE.Mesh(spireGeometry, emeraldMaterial);
        spire.position.y = 11;
        group.add(spire);
        
        mainObject = group;
      } else {
        const group = new THREE.Group();
        const hubGeometry = new THREE.SphereGeometry(1, 16, 16);
        const hub = new THREE.Mesh(hubGeometry, goldMaterial);
        group.add(hub);
        
        for (let i = 0; i < 2; i++) {
          const ringGeometry = new THREE.TorusGeometry(2 + i, 0.2, 8, 32);
          const ring = new THREE.Mesh(ringGeometry, emeraldMaterial);
          ring.rotation.x = Math.PI / 2;
          ring.position.y = i * 0.5 - 0.25;
          group.add(ring);
        }
        
        mainObject = group;
      }

      scene.add(mainObject);

      // Animation
      let time = 0;
      const animate = () => {
        time += 0.01;
        mainObject.rotation.y = time * 0.5;
        
        // Base orbit position
        const baseX = Math.cos(time * 0.3) * 8;
        const baseZ = Math.sin(time * 0.3) * 8;
        
        // Apply gyroscope offset if available
        const gyroOffsetX = (orientationRef.current.gamma / 90) * 3; // Max 3 units shift
        const gyroOffsetY = (orientationRef.current.beta / 180) * 2; // Max 2 units shift
        
        // Blend auto-orbit with gyroscope control
        camera.position.x = baseX + gyroOffsetX;
        camera.position.y = 6 + gyroOffsetY;
        camera.position.z = baseZ;
        camera.lookAt(0, 0, 0);
        
        accentLight.intensity = 0.5 + Math.sin(time * 2) * 0.2;

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

      // Handle resize
      const handleResize = () => {
        if (!container || !renderer) return;
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
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
      console.error('Error initializing 3D visualization:', err);
      setIsLoading(false);
      setError(true);
      if (renderer) {
        renderer.dispose();
      }
    }
  }, [projectType]);

  // Update orientation ref for use in animation loop
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
      className={className}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
          <div className="text-primary animate-pulse text-sm">Initializing 3D View...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
          <div className="text-muted-foreground text-xs">3D preview unavailable</div>
        </div>
      )}
      {isSupported && !isLoading && !error && (
        <div className="absolute bottom-1 right-1 text-xs text-muted-foreground/70 bg-card/60 px-1.5 py-0.5 rounded">
          Tilt to explore
        </div>
      )}
    </div>
  );
}
