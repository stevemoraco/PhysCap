import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface TabeguacheResort3DProps {
  className?: string;
}

export function TabeguacheResort3D({ className }: TabeguacheResort3DProps) {
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
      console.warn('WebGL not supported for Tabeguache resort visualization');
      setIsLoading(false);
      setError(true);
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;

    try {
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x87CEEB); // Sky blue
      scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

      // Camera
      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
      camera.position.set(25, 15, 25);
      camera.lookAt(0, 0, 0);

      // Renderer
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

      // Lighting - Natural mountain lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffd700, 1.2);
      sunLight.position.set(30, 40, 20);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.left = -50;
      sunLight.shadow.camera.right = 50;
      sunLight.shadow.camera.top = 50;
      sunLight.shadow.camera.bottom = -50;
      scene.add(sunLight);

      // Accent lighting
      const accentLight = new THREE.PointLight(0x50c878, 0.4, 40);
      accentLight.position.set(-10, 10, -10);
      scene.add(accentLight);

      // Mountain terrain base
      const terrainGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
      const vertices = terrainGeometry.attributes.position.array;
      
      // Create rolling hills
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        vertices[i + 2] = Math.sin(x * 0.1) * 2 + Math.cos(y * 0.1) * 2 - 1;
      }
      terrainGeometry.computeVertexNormals();

      const terrainMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22, // Forest green
        roughness: 0.9,
        metalness: 0.1,
      });
      const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
      terrain.rotation.x = -Math.PI / 2;
      terrain.receiveShadow = true;
      terrain.position.y = -2;
      scene.add(terrain);

      // Materials for buildings
      const lodgeMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Wood brown
        roughness: 0.7,
        metalness: 0.2,
      });

      const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x2F4F4F, // Dark slate
        roughness: 0.8,
        metalness: 0.3,
      });

      const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x87CEEB,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.7,
      });

      const luxuryMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37, // Gold accents
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0xd4af37,
        emissiveIntensity: 0.2,
      });

      // Resort buildings
      const buildings: THREE.Group[] = [];

      // Main Lodge (center, largest)
      const mainLodge = new THREE.Group();
      const mainBody = new THREE.Mesh(
        new THREE.BoxGeometry(8, 6, 6),
        lodgeMaterial
      );
      mainBody.position.y = 3;
      mainBody.castShadow = true;
      mainLodge.add(mainBody);

      // Main lodge roof
      const mainRoof = new THREE.Mesh(
        new THREE.ConeGeometry(6, 3, 4),
        roofMaterial
      );
      mainRoof.position.y = 7.5;
      mainRoof.rotation.y = Math.PI / 4;
      mainRoof.castShadow = true;
      mainLodge.add(mainRoof);

      // Golden entrance feature
      const entrance = new THREE.Mesh(
        new THREE.BoxGeometry(2, 4, 0.5),
        luxuryMaterial
      );
      entrance.position.set(0, 2, 3.25);
      mainLodge.add(entrance);

      // Windows
      for (let i = -2; i <= 2; i += 2) {
        const window1 = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 1.5, 0.2),
          glassMaterial
        );
        window1.position.set(i, 3.5, 3.1);
        mainLodge.add(window1);
      }

      mainLodge.position.set(0, 0, 0);
      scene.add(mainLodge);
      buildings.push(mainLodge);

      // Guest Cabins (6 smaller buildings arranged in arc)
      for (let i = 0; i < 6; i++) {
        const cabin = new THREE.Group();
        
        const cabinBody = new THREE.Mesh(
          new THREE.BoxGeometry(4, 4, 4),
          lodgeMaterial
        );
        cabinBody.position.y = 2;
        cabinBody.castShadow = true;
        cabin.add(cabinBody);

        const cabinRoof = new THREE.Mesh(
          new THREE.ConeGeometry(3, 2, 4),
          roofMaterial
        );
        cabinRoof.position.y = 5;
        cabinRoof.rotation.y = Math.PI / 4;
        cabinRoof.castShadow = true;
        cabin.add(cabinRoof);

        // Cabin windows
        const window1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 1, 0.2),
          glassMaterial
        );
        window1.position.set(0, 2.5, 2.1);
        cabin.add(window1);

        // Position cabins in semi-circle
        const angle = (i / 6) * Math.PI * 1.5 - Math.PI * 0.75;
        const radius = 15;
        cabin.position.set(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        );
        cabin.rotation.y = -angle;
        
        scene.add(cabin);
        buildings.push(cabin);
      }

      // Luxury Spa Building (modern glass structure)
      const spa = new THREE.Group();
      const spaBody = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, 5, 8),
        glassMaterial
      );
      spaBody.position.y = 2.5;
      spaBody.castShadow = true;
      spa.add(spaBody);

      const spaRoof = new THREE.Mesh(
        new THREE.ConeGeometry(4.5, 2, 8),
        luxuryMaterial
      );
      spaRoof.position.y = 6;
      spaRoof.castShadow = true;
      spa.add(spaRoof);

      spa.position.set(-12, 0, 8);
      scene.add(spa);
      buildings.push(spa);

      // Trees (pine trees scattered around)
      const createTree = (x: number, z: number, scale: number = 1) => {
        const tree = new THREE.Group();
        
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 2 * scale, 6),
          new THREE.MeshStandardMaterial({ color: 0x4A3C28 })
        );
        trunk.position.y = 1 * scale;
        tree.add(trunk);

        const foliage = new THREE.Mesh(
          new THREE.ConeGeometry(1 * scale, 3 * scale, 6),
          new THREE.MeshStandardMaterial({ color: 0x0F4D0F })
        );
        foliage.position.y = 3 * scale;
        tree.add(foliage);

        tree.position.set(x, -1.5, z);
        scene.add(tree);
      };

      // Scatter trees around resort
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 25 + Math.random() * 15;
        createTree(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0.8 + Math.random() * 0.4
        );
      }

      // Animation
      let time = 0;
      const animate = () => {
        time += 0.01;

        // Base orbit position
        const baseX = Math.cos(time * 0.15) * 25;
        const baseZ = Math.sin(time * 0.15) * 25;
        
        // Apply gyroscope offset
        const gyroOffsetX = (orientationRef.current.gamma / 90) * 8;
        const gyroOffsetY = (orientationRef.current.beta / 180) * 4;
        
        camera.position.x = baseX + gyroOffsetX;
        camera.position.y = 15 + gyroOffsetY;
        camera.position.z = baseZ;
        camera.lookAt(0, 2, 0);

        // Subtle building animations
        buildings.forEach((building, i) => {
          const offset = i * 0.5;
          building.position.y = Math.sin(time * 0.5 + offset) * 0.05;
        });

        // Animate accent light
        accentLight.intensity = 0.4 + Math.sin(time * 2) * 0.1;

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
      console.error('Error initializing Tabeguache resort visualization:', err);
      setIsLoading(false);
      setError(true);
      if (renderer) {
        renderer.dispose();
      }
    }
  }, []);

  // Update orientation ref
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
          <div className="text-primary animate-pulse text-sm">Building Resort...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
          <div className="text-muted-foreground text-xs">3D resort preview unavailable</div>
        </div>
      )}
      {isSupported && !isLoading && !error && (
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded">
          Tilt phone to explore resort
        </div>
      )}
    </div>
  );
}
