import { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';

export interface InteractiveObject {
  mesh: THREE.Mesh | THREE.Group;
  label: string;
  description: string;
}

export interface TooltipInfo {
  label: string;
  description: string;
  position: { x: number; y: number };
}

export function use3DInteraction() {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const handleClick = useCallback(
    (
      event: MouseEvent | TouchEvent,
      camera: THREE.Camera,
      interactiveObjects: InteractiveObject[],
      container: HTMLElement,
      onObjectClick?: (object: InteractiveObject) => void
    ) => {
      const rect = container.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ('touches' in event && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else if ('clientX' in event) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else {
        return;
      }

      mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      const meshes = interactiveObjects.map(obj => obj.mesh);
      const intersects = raycaster.current.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        let intersectedMesh = intersects[0].object;
        
        while (intersectedMesh.parent && !meshes.includes(intersectedMesh as any)) {
          intersectedMesh = intersectedMesh.parent;
        }

        const matchedObject = interactiveObjects.find(
          obj => obj.mesh === intersectedMesh || obj.mesh.children.includes(intersectedMesh as any)
        );

        if (matchedObject) {
          setSelectedObject(matchedObject.label);
          setTooltip({
            label: matchedObject.label,
            description: matchedObject.description,
            position: { x: clientX - rect.left, y: clientY - rect.top },
          });

          if (onObjectClick) {
            onObjectClick(matchedObject);
          }
        }
      } else {
        setTooltip(null);
        setSelectedObject(null);
      }
    },
    []
  );

  const handleMouseMove = useCallback(
    (
      event: MouseEvent,
      camera: THREE.Camera,
      interactiveObjects: InteractiveObject[],
      container: HTMLElement
    ) => {
      const rect = container.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const meshes = interactiveObjects.map(obj => obj.mesh);
      const intersects = raycaster.current.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
      } else {
        container.style.cursor = 'default';
      }
    },
    []
  );

  const zoomToObject = useCallback(
    (
      camera: THREE.PerspectiveCamera,
      object: THREE.Mesh | THREE.Group,
      duration: number = 1000
    ) => {
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5;

      const direction = new THREE.Vector3()
        .subVectors(camera.position, center)
        .normalize();
      const targetPosition = new THREE.Vector3()
        .copy(center)
        .add(direction.multiplyScalar(cameraDistance));

      const startPosition = camera.position.clone();
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        
        const easeT = t < 0.5
          ? 2 * t * t
          : -1 + (4 - 2 * t) * t;

        camera.position.lerpVectors(startPosition, targetPosition, easeT);
        camera.lookAt(center);

        if (t < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    },
    []
  );

  const clearTooltip = useCallback(() => {
    setTooltip(null);
    setSelectedObject(null);
  }, []);

  return {
    tooltip,
    selectedObject,
    handleClick,
    handleMouseMove,
    zoomToObject,
    clearTooltip,
  };
}
