import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';

interface GyroscopePermissionProps {
  onPermissionGranted?: () => void;
}

export function GyroscopePermission({ onPermissionGranted }: GyroscopePermissionProps) {
  const [permissionState, setPermissionState] = useState<'unknown' | 'prompt' | 'granted' | 'denied'>('unknown');
  const [needsPermission, setNeedsPermission] = useState(false);

  useEffect(() => {
    // Check if we need to request permission (iOS 13+)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const hasRequestPermission = typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    
    if (isIOS && hasRequestPermission) {
      setNeedsPermission(true);
      setPermissionState('prompt');
    } else if ('DeviceOrientationEvent' in window) {
      // Permission not needed, just check support
      setPermissionState('granted');
      onPermissionGranted?.();
    } else {
      setPermissionState('denied');
    }
  }, [onPermissionGranted]);

  const requestPermission = async () => {
    try {
      const response = await (DeviceOrientationEvent as any).requestPermission();
      if (response === 'granted') {
        setPermissionState('granted');
        onPermissionGranted?.();
      } else {
        setPermissionState('denied');
      }
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
      setPermissionState('denied');
    }
  };

  if (!needsPermission || permissionState === 'granted') {
    return null;
  }

  if (permissionState === 'denied') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="max-w-md mx-4 p-6 bg-card rounded-lg border shadow-lg">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <Smartphone className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Motion Access Denied</h2>
              <p className="text-sm text-muted-foreground">
                To experience the full interactive 3D visualizations, please enable motion & orientation access in your device settings.
              </p>
            </div>
            <Button
              onClick={() => {
                setPermissionState('granted');
                onPermissionGranted?.();
              }}
              variant="outline"
              data-testid="button-continue-without-gyro"
            >
              Continue Without Motion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="max-w-md mx-4 p-6 bg-card rounded-lg border shadow-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Enhanced Experience</h2>
            <p className="text-sm text-muted-foreground">
              Tilt your device to explore our 3D investment visualizations from every angle. This creates an immersive, interactive experience.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={requestPermission}
              className="w-full"
              data-testid="button-enable-gyro"
            >
              Enable Motion Control
            </Button>
            <Button
              onClick={() => {
                setPermissionState('granted');
                onPermissionGranted?.();
              }}
              variant="ghost"
              className="w-full"
              data-testid="button-skip-gyro"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
