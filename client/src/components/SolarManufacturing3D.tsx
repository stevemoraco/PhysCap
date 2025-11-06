import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface SolarManufacturing3DProps {
  className?: string;
}

export function SolarManufacturing3D({ className }: SolarManufacturing3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { orientation, isSupported } = useDeviceOrientation();
  const orientationRef = useRef({ beta: 0, gamma: 0 });
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    panels: THREE.Mesh[];
    robots: THREE.Group[];
    animationId: number | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a2e2c);
    scene.fog = new THREE.Fog(0x0a2e2c, 10, 50);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 0, 0);

    // Renderer setup with GPU acceleration
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting - Luxurious golden ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main golden light
    const mainLight = new THREE.DirectionalLight(0xd4af37, 0.8);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Accent emerald light
    const accentLight = new THREE.PointLight(0x50c878, 0.6, 50);
    accentLight.position.set(-10, 8, -10);
    scene.add(accentLight);

    // Factory floor
    const floorGeometry = new THREE.PlaneGeometry(40, 40);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f3d3a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid lines - subtle gold
    const gridHelper = new THREE.GridHelper(40, 40, 0xd4af37, 0x1a5450);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Solar panel materials
    const panelMaterials = {
      frame: new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.9,
        roughness: 0.1,
      }),
      cells: new THREE.MeshStandardMaterial({
        color: 0x1a3c5a,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x0a1f2e,
        emissiveIntensity: 0.2,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9,
        thickness: 0.5,
      }),
    };

    // Create solar panels
    const panels: THREE.Mesh[] = [];
    const panelCount = 8;

    for (let i = 0; i < panelCount; i++) {
      const panelGroup = new THREE.Group();
      
      // Frame
      const frameGeometry = new THREE.BoxGeometry(2, 0.05, 1);
      const frame = new THREE.Mesh(frameGeometry, panelMaterials.frame);
      frame.castShadow = true;
      panelGroup.add(frame);

      // Solar cells (grid pattern)
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 10; col++) {
          const cellGeometry = new THREE.BoxGeometry(0.18, 0.02, 0.09);
          const cell = new THREE.Mesh(cellGeometry, panelMaterials.cells);
          cell.position.set(
            (col - 4.5) * 0.19,
            0.04,
            (row - 2.5) * 0.16
          );
          panelGroup.add(cell);
        }
      }

      // Glass cover
      const glassGeometry = new THREE.BoxGeometry(1.9, 0.01, 0.95);
      const glass = new THREE.Mesh(glassGeometry, panelMaterials.glass);
      glass.position.y = 0.06;
      panelGroup.add(glass);

      // Position panels in assembly line
      const angle = (i / panelCount) * Math.PI * 2;
      const radius = 8;
      panelGroup.position.set(
        Math.cos(angle) * radius,
        -2 + Math.random() * 0.5,
        Math.sin(angle) * radius
      );
      panelGroup.rotation.y = -angle + Math.PI / 2;

      scene.add(panelGroup);
      panels.push(frame);
    }

    // Create robots (simplified humanoid forms)
    const robots: THREE.Group[] = [];
    const robotMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xd4af37,
      emissiveIntensity: 0.1,
    });

    for (let i = 0; i < 3; i++) {
      const robot = new THREE.Group();

      // Body
      const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.35, 1.5, 8);
      const body = new THREE.Mesh(bodyGeometry, robotMaterial);
      body.castShadow = true;
      robot.add(body);

      // Head
      const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
      const head = new THREE.Mesh(headGeometry, robotMaterial);
      head.position.y = 1;
      robot.add(head);

      // Arms (simple cylinders)
      const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 6);
      const leftArm = new THREE.Mesh(armGeometry, robotMaterial);
      leftArm.position.set(-0.5, 0.2, 0);
      leftArm.rotation.z = 0.3;
      robot.add(leftArm);

      const rightArm = new THREE.Mesh(armGeometry, robotMaterial);
      rightArm.position.set(0.5, 0.2, 0);
      rightArm.rotation.z = -0.3;
      robot.add(rightArm);

      // Position robots around the factory
      const robotAngle = (i / 3) * Math.PI * 2;
      const robotRadius = 5;
      robot.position.set(
        Math.cos(robotAngle) * robotRadius,
        0.75,
        Math.sin(robotAngle) * robotRadius
      );

      scene.add(robot);
      robots.push(robot);
    }

    // Animation loop with physics
    let time = 0;
    const animate = () => {
      time += 0.01;

      // Base orbit position
      const baseX = Math.cos(time * 0.2) * 15;
      const baseZ = Math.sin(time * 0.2) * 15;
      
      // Apply gyroscope offset if available
      const gyroOffsetX = (orientationRef.current.gamma / 90) * 5; // Max 5 units shift
      const gyroOffsetY = (orientationRef.current.beta / 180) * 3; // Max 3 units shift
      
      // Blend auto-orbit with gyroscope control
      camera.position.x = baseX + gyroOffsetX;
      camera.position.y = 10 + gyroOffsetY;
      camera.position.z = baseZ;
      camera.lookAt(0, 0, 0);

      // Animate panels - rising and rotating
      panels.forEach((panel, i) => {
        const parent = panel.parent;
        if (parent) {
          const progress = (time + i * 0.5) % (Math.PI * 2);
          parent.position.y = -2 + Math.sin(progress) * 2 + 2;
          parent.rotation.x = Math.sin(time + i) * 0.1;
        }
      });

      // Animate robots - working motion
      robots.forEach((robot, i) => {
        const robotTime = time + i * Math.PI * 0.66;
        robot.rotation.y = Math.sin(robotTime * 0.5) * 0.3;
        
        // Arm motion
        const arms = robot.children.slice(2);
        arms.forEach((arm, armIndex) => {
          const armMesh = arm as THREE.Mesh;
          const direction = armIndex === 0 ? 1 : -1;
          armMesh.rotation.z = direction * (0.3 + Math.sin(robotTime * 2) * 0.2);
        });
      });

      // Pulse accent light
      accentLight.intensity = 0.6 + Math.sin(time * 2) * 0.2;

      renderer.render(scene, camera);
      const animationId = requestAnimationFrame(animate);
      sceneRef.current!.animationId = animationId;
    };

    sceneRef.current = {
      scene,
      camera,
      renderer,
      panels,
      robots,
      animationId: null,
    };

    setIsLoading(false);
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
  }, []);

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
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
          <div className="text-primary animate-pulse">Initializing 3D View...</div>
        </div>
      )}
      {isSupported && (
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded">
          Tilt phone to explore
        </div>
      )}
    </div>
  );
}
