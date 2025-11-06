import { useState } from "react";
import { cn } from "@/lib/utils";
import { SolarManufacturingExperience } from "./experiences/SolarManufacturingExperience";
import { SolarManufacturingFallback } from "./experiences/SolarManufacturingFallback";
import { useAuth } from "@/hooks/useAuth";
import { useInteractionTracking } from "@/hooks/useInteractionTracking";

interface SolarManufacturing3DProps {
  className?: string;
  quality?: "auto" | "very-low" | "low" | "medium" | "high" | "ultra";
}

export function SolarManufacturing3D({
  className,
  quality = "auto",
}: SolarManufacturing3DProps) {
  const [mode, setMode] = useState<"loading" | "webgpu" | "fallback">("loading");
  const { user } = useAuth();
  const { track3DInteraction } = useInteractionTracking(user?.id);

  return (
    <div className={cn("relative h-full w-full", className)}>
      {(mode === "loading" || mode === "fallback") && (
        <SolarManufacturingFallback
          className="absolute inset-0"
          onObjectInteraction={(event) =>
            track3DInteraction(event.objectId, event.action as any)
          }
        />
      )}

      {mode !== "fallback" && (
        <SolarManufacturingExperience
          className="absolute inset-0"
          quality={quality}
          onReady={() => setMode("webgpu")}
          onUnavailable={() => setMode("fallback")}
          onError={() => setMode("fallback")}
        />
      )}
    </div>
  );
}
