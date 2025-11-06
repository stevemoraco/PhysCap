import { useState } from "react";
import { cn } from "@/lib/utils";
import { SolarManufacturingExperience } from "./experiences/SolarManufacturingExperience";
import { SolarManufacturingFallback } from "./experiences/SolarManufacturingFallback";

interface SolarManufacturing3DProps {
  className?: string;
  quality?: "auto" | "very-low" | "low" | "medium" | "high" | "ultra";
}

export function SolarManufacturing3D({
  className,
  quality = "auto",
}: SolarManufacturing3DProps) {
  const [mode, setMode] = useState<"loading" | "webgpu" | "fallback">("loading");

  return (
    <div className={cn("relative h-full w-full", className)}>
      {(mode === "loading" || mode === "fallback") && (
        <SolarManufacturingFallback className="absolute inset-0" />
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

