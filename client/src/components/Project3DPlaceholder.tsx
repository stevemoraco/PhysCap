import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Project3DPlaceholderProps {
  projectType: 'resort' | 'tower' | 'orbital';
  className?: string;
}

export function Project3DPlaceholder({ projectType, className }: Project3DPlaceholderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    animationId: number | null;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a2e2c);
    scene.fog = new THREE.Fog(0x0a2e2c, 10, 50);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
      // Resort: Collection of lodge buildings
      const group = new THREE.Group();
      
      for (let i = 0; i < 5; i++) {
        const buildingGeometry = new THREE.BoxGeometry(1, 1 + Math.random(), 1);
        const building = new THREE.Mesh(buildingGeometry, goldMaterial);
        building.position.set(
          (i - 2) * 2,
          0.5,
          Math.random() * 2 - 1
        );
        group.add(building);
      }
      
      mainObject = group;
    } else if (projectType === 'tower') {
      // Tower: Tall skyscraper
      const group = new THREE.Group();
      
      // Main tower body
      const towerGeometry = new THREE.CylinderGeometry(0.8, 1, 10, 8);
      const tower = new THREE.Mesh(towerGeometry, goldMaterial);
      tower.position.y = 5;
      group.add(tower);
      
      // Spire
      const spireGeometry = new THREE.ConeGeometry(0.8, 2, 8);
      const spire = new THREE.Mesh(spireGeometry, emeraldMaterial);
      spire.position.y = 11;
      group.add(spire);
      
      mainObject = group;
    } else {
      // Orbital: Space station
      const group = new THREE.Group();
      
      // Central hub
      const hubGeometry = new THREE.SphereGeometry(1, 16, 16);
      const hub = new THREE.Mesh(hubGeometry, goldMaterial);
      group.add(hub);
      
      // Rings
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

      // Rotate object
      mainObject.rotation.y = time * 0.5;
      
      // Orbit camera
      camera.position.x = Math.cos(time * 0.3) * 8;
      camera.position.z = Math.sin(time * 0.3) * 8;
      camera.lookAt(0, 0, 0);

      // Pulse accent light
      accentLight.intensity = 0.5 + Math.sin(time * 2) * 0.2;

      renderer.render(scene, camera);
      const animationId = requestAnimationFrame(animate);
      sceneRef.current!.animationId = animationId;
    };

    sceneRef.current = { renderer, animationId: null };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
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
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [projectType]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
