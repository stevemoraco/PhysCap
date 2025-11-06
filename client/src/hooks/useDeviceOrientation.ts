import { useState, useEffect } from 'react';

export interface DeviceOrientation {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    alpha: null,
    beta: null,
    gamma: null,
  });
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      setIsSupported(true);

      const handleOrientation = (event: DeviceOrientationEvent) => {
        setOrientation({
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma,
        });
      };

      window.addEventListener('deviceorientation', handleOrientation);

      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    }
  }, []);

  return { orientation, isSupported };
}
