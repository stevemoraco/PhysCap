import { useState, useEffect } from "react";

export interface DevicePerformance {
  isMobile: boolean;
  isLowEnd: boolean;
  targetFPS: number;
  quality: 'low' | 'medium' | 'high';
  pixelRatio: number;
  maxParticles: number;
  shadowsEnabled: boolean;
  antialiasEnabled: boolean;
}

export function useDevicePerformance(): DevicePerformance {
  const [performance, setPerformance] = useState<DevicePerformance>(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;
    
    // Detect low-end devices
    const isLowEnd = isMobile && (
      // Low memory devices
      (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4 ||
      // Older iOS devices
      /iPhone (5|6|7|8|SE)/i.test(navigator.userAgent) ||
      // Lower resolution devices
      window.innerWidth < 375
    );

    // Determine quality tier
    let quality: 'low' | 'medium' | 'high';
    if (isLowEnd) {
      quality = 'low';
    } else if (isMobile) {
      quality = 'medium';
    } else {
      quality = 'high';
    }

    return {
      isMobile,
      isLowEnd,
      targetFPS: isLowEnd ? 24 : isMobile ? 30 : 60,
      quality,
      pixelRatio: Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
      maxParticles: isLowEnd ? 15 : isMobile ? 25 : 40,
      shadowsEnabled: !isMobile,
      antialiasEnabled: !isLowEnd,
    };
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = window.performance.now();
    let avgFPS = 60;

    const measurePerformance = () => {
      frameCount++;
      const currentTime = window.performance.now();
      const elapsed = currentTime - lastTime;

      // Measure FPS every second
      if (elapsed >= 1000) {
        avgFPS = (frameCount / elapsed) * 1000;
        frameCount = 0;
        lastTime = currentTime;

        // Dynamically adjust quality if FPS is consistently low
        setPerformance(prev => {
          if (avgFPS < prev.targetFPS * 0.7 && prev.quality !== 'low') {
            const newQuality = prev.quality === 'high' ? 'medium' : 'low';
            return {
              ...prev,
              quality: newQuality,
              pixelRatio: newQuality === 'low' ? 1 : Math.min(prev.pixelRatio, 1.5),
              maxParticles: newQuality === 'low' ? 15 : 25,
              shadowsEnabled: false,
              antialiasEnabled: newQuality !== 'low',
            };
          }
          return prev;
        });
      }

      requestAnimationFrame(measurePerformance);
    };

    const rafId = requestAnimationFrame(measurePerformance);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return performance;
}
