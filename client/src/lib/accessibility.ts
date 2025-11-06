import * as THREE from 'three';

// Keyboard navigation for 3D scenes
export function enable3DKeyboardNav(
  camera: THREE.Camera,
  scene: THREE.Scene,
  interactiveObjects: Array<{ mesh: THREE.Object3D; label: string; description: string }>,
  onObjectActivate?: (object: any) => void
) {
  let currentFocusIndex = -1;
  const focusableObjects = [...interactiveObjects];

  const handleKeyDown = (e: KeyboardEvent) => {
    const focusedObject = currentFocusIndex >= 0 ? focusableObjects[currentFocusIndex] : null;

    switch (e.key) {
      case 'Tab': {
        e.preventDefault();
        // Cycle through interactive objects
        if (e.shiftKey) {
          currentFocusIndex = currentFocusIndex <= 0 ? focusableObjects.length - 1 : currentFocusIndex - 1;
        } else {
          currentFocusIndex = (currentFocusIndex + 1) % focusableObjects.length;
        }

        const newFocused = focusableObjects[currentFocusIndex];
        if (newFocused) {
          announceToScreenReader(`Focused on ${newFocused.label}: ${newFocused.description}`);
          highlightObject(newFocused.mesh);
        }
        break;
      }

      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (focusedObject && onObjectActivate) {
          announceToScreenReader(`Activated ${focusedObject.label}`);
          onObjectActivate(focusedObject);
        }
        break;
      }

      case 'ArrowLeft': {
        e.preventDefault();
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.position.x -= 1;
          announceToScreenReader('Camera moved left');
        }
        break;
      }

      case 'ArrowRight': {
        e.preventDefault();
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.position.x += 1;
          announceToScreenReader('Camera moved right');
        }
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.position.y += 1;
          announceToScreenReader('Camera moved up');
        }
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.position.y -= 1;
          announceToScreenReader('Camera moved down');
        }
        break;
      }

      case 'Escape': {
        e.preventDefault();
        currentFocusIndex = -1;
        clearHighlights(scene);
        announceToScreenReader('Cleared selection');
        break;
      }

      case '?': {
        e.preventDefault();
        announceKeyboardShortcuts();
        break;
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

// Highlight object for keyboard focus
function highlightObject(object: THREE.Object3D) {
  // Remove previous highlights
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if ((child as any).originalEmissive) {
        child.material.emissive = (child as any).originalEmissive;
      }
    }
  });

  // Add highlight
  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const material = child.material as THREE.MeshStandardMaterial;
      if (material.emissive) {
        (child as any).originalEmissive = material.emissive.clone();
        material.emissive.setHex(0xffff00); // Yellow highlight
      }
    }
  });
}

// Clear all highlights
function clearHighlights(scene: THREE.Scene) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && (child as any).originalEmissive) {
      child.material.emissive = (child as any).originalEmissive;
      delete (child as any).originalEmissive;
    }
  });
}

// Screen reader announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.textContent = message;
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';

  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);
}

// Announce keyboard shortcuts
function announceKeyboardShortcuts() {
  const shortcuts = `
    Keyboard shortcuts:
    Tab - Navigate between objects
    Enter or Space - Activate selected object
    Arrow keys - Move camera
    Escape - Clear selection
    ? - Show this help
  `;
  announceToScreenReader(shortcuts, 'assertive');
}

// Focus trap for modals
export function createFocusTrap(container: HTMLElement) {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

// Skip to main content link
export function createSkipLink() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    z-index: 100;
    text-decoration: none;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  document.body.insertBefore(skipLink, document.body.firstChild);
}

// ARIA live region for dynamic updates
export function createLiveRegion(id: string = 'aria-live-region') {
  const existing = document.getElementById(id);
  if (existing) return existing;

  const liveRegion = document.createElement('div');
  liveRegion.id = id;
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;

  document.body.appendChild(liveRegion);
  return liveRegion;
}

// Update live region
export function updateLiveRegion(message: string, id: string = 'aria-live-region') {
  const liveRegion = document.getElementById(id) || createLiveRegion(id);
  liveRegion.textContent = message;
}

// Check contrast ratio
export function checkContrastRatio(foreground: string, background: string): number {
  const rgb1 = hexToRgb(foreground);
  const rgb2 = hexToRgb(background);

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Reduce motion preference
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// High contrast mode
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}
