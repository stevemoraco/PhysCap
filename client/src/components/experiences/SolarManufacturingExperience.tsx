import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type QualityPreset = "auto" | "very-low" | "low" | "medium" | "high" | "ultra";

interface SolarManufacturingExperienceProps {
  className?: string;
  quality?: QualityPreset;
  onReady?: () => void;
  onUnavailable?: () => void;
  onError?: (error: unknown) => void;
}

type SolarWebgpuModule = typeof import("@/experiences/solar-webgpu/index");

const qualityLabelMap: Record<QualityPreset, string> = {
  "auto": "Auto",
  "very-low": "Very Low",
  "low": "Low",
  "medium": "Medium",
  "high": "High",
  "ultra": "Ultra",
};

const qualityScaleMap: Partial<Record<QualityPreset, number>> = {
  "very-low": 0.3,
  "low": 0.5,
  "medium": 0.7,
  "high": 0.85,
  "ultra": 1.0,
};

export function SolarManufacturingExperience({
  className,
  quality = "auto",
  onReady,
  onUnavailable,
  onError,
}: SolarManufacturingExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const moduleRef = useRef<SolarWebgpuModule | null>(null);
  const [status, setStatus] = useState<
    "idle" | "initializing" | "unsupported" | "ready" | "error"
  >("idle");

  /**
   * Apply a quality preset using the TypeGPU control surface.
   */
  const applyQualityPreset = (preset: QualityPreset) => {
    const mod = moduleRef.current;
    if (!mod) return;
    const qualityControl = mod.controls?.["Quality"];
    if (!qualityControl) return;
    qualityControl.onSelectChange(qualityLabelMap[preset] ?? "Auto");
  };

  useEffect(() => {
    if (status !== "ready") return;
    applyQualityPreset(quality);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, status]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !(navigator as any).gpu) {
      setStatus("unsupported");
      onUnavailable?.();
      return;
    }

    let cancelled = false;

    async function boot() {
      try {
        setStatus("initializing");
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (!canvas || !container) {
          throw new Error("SolarManufacturingExperience canvas not mounted.");
        }

        const pixelRatio = window.devicePixelRatio || 1;
        const width = Math.max(
          1,
          Math.floor((container.clientWidth || 1) * pixelRatio),
        );
        const height = Math.max(
          1,
          Math.floor((container.clientHeight || 1) * pixelRatio),
        );
        canvas.width = width;
        canvas.height = height;

        const globalScope = globalThis as typeof globalThis & {
          __PHYSICAL_CAPITAL_SOLAR_CANVAS__?: HTMLCanvasElement;
          __PHYSICAL_CAPITAL_SOLAR_QUALITY__?: number;
        };

        globalScope.__PHYSICAL_CAPITAL_SOLAR_CANVAS__ = canvas;
        if (quality !== "auto" && qualityScaleMap[quality]) {
          globalScope.__PHYSICAL_CAPITAL_SOLAR_QUALITY__ =
            qualityScaleMap[quality];
        } else {
          delete globalScope.__PHYSICAL_CAPITAL_SOLAR_QUALITY__;
        }

        const mod: SolarWebgpuModule = await import(
          "@/experiences/solar-webgpu/index"
        );

        if (cancelled) {
          mod.onCleanup();
          return;
        }

        moduleRef.current = mod;
        cleanupRef.current = () => {
          mod.onCleanup();
          moduleRef.current = null;
        };

        applyQualityPreset(quality);

        setStatus("ready");
        onReady?.();
      } catch (error) {
        console.error("Failed to initialize WebGPU solar experience", error);
        setStatus("error");
        onError?.(error);
      }
    }

    boot();

    return () => {
      cancelled = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden rounded-xl", className)}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        aria-hidden
      />

      <div
        id="attribution"
        className="pointer-events-auto absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-md bg-black/70 px-4 py-2 text-xs text-white opacity-100 transition-opacity duration-500"
      >
        Inspired by work of{" "}
        <a
          href="https://x.com/cerpow/status/1964953851603358112"
          target="_blank"
          rel="noreferrer"
          className="text-sky-300 underline-offset-2 hover:underline"
        >
          Voicu Apostol
        </a>
      </div>

      {status === "initializing" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md">
          <div className="text-sm text-primary animate-pulse">
            Initializing photonic renderer…
          </div>
        </div>
      )}

      {status === "unsupported" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-md">
          <div className="max-w-xs text-center text-xs text-muted-foreground">
            Your device does not support WebGPU. Rendering high-fidelity solar
            manufacturing experience requires a WebGPU-capable browser.
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-md">
          <div className="max-w-xs text-center text-xs text-muted-foreground">
            We hit a snag while loading the photonic renderer. Reload the page
            to try again, or explore the interactive fallback view below.
          </div>
        </div>
      )}
    </div>
  );
}
