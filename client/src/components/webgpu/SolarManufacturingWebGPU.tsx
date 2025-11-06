import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useWebGPU } from '@/hooks/useWebGPU';
import { useGyroscopeCaustics } from '@/hooks/useGyroscopeCaustics';
import { createRenderPipeline, type PipelineConfig, type SceneUniforms } from '@/lib/webgpu/pipeline';
import { PerformanceMonitor, QualityPresets, ProgressiveLoader, detectGPUTier } from '@/lib/webgpu/performance';
import { TAAAccumulator, TAAPresets } from '@/lib/webgpu/taa';
import { CausticsRenderer, CausticsPresets } from '@/lib/webgpu/caustics';

export interface ManufacturingStage {
  id: string;
  name: string;
  position: [number, number, number];
  description: string;
  color: string;
}

const MANUFACTURING_STAGES: ManufacturingStage[] = [
  {
    id: 'polysilicon',
    name: 'Polysilicon Purification',
    position: [8, 0, 0],
    description: 'High-purity silicon extraction from raw materials',
    color: '#ff6b35',
  },
  {
    id: 'wafer',
    name: 'Wafer Slicing',
    position: [4.9, 0, 6.9],
    description: 'Diamond wire saw cutting silicon ingots into thin wafers',
    color: '#d4af37',
  },
  {
    id: 'cell',
    name: 'Cell Processing',
    position: [-4.9, 0, 6.9],
    description: 'HJT heterojunction coating with plasma deposition',
    color: '#50c878',
  },
  {
    id: 'module',
    name: 'Module Assembly',
    position: [-8, 0, 0],
    description: 'Glass lamination and encapsulation',
    color: '#4a90e2',
  },
  {
    id: 'inspection',
    name: 'Quality Inspection',
    position: [0, 0, -8],
    description: 'Automated testing with robotic precision',
    color: '#9b59b6',
  },
];

interface SolarManufacturingWebGPUProps {
  className?: string;
  fallback?: React.ReactNode;
  mockWebGPU?: boolean;
  onStageClick?: (stageId: string) => void;
  onStageInteraction?: (stageId: string, duration: number) => void;
}

export function SolarManufacturingWebGPU({
  className,
  fallback,
  mockWebGPU = false,
  onStageClick,
  onStageInteraction,
}: SolarManufacturingWebGPUProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const webgpu = useWebGPU();
  const gyro = useGyroscopeCaustics({ intensity: 1.5, autoIntensity: true });

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(60);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');

  // Refs for rendering state
  const renderStateRef = useRef<{
    device: GPUDevice;
    context: GPUCanvasContext;
    pipeline: GPURenderPipeline;
    bindGroup: GPUBindGroup;
    uniformBuffer: GPUBuffer;
    performanceMonitor: PerformanceMonitor;
    loader: ProgressiveLoader;
    taa: TAAAccumulator | null;
    caustics: CausticsRenderer | null;
    animationId: number | null;
    time: number;
    cameraPosition: [number, number, number];
    cameraTarget: [number, number, number];
    interactionStartTime: Map<string, number>;
  } | null>(null);

  // Initialize WebGPU pipeline
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    if (mockWebGPU) return; // Skip init in test mode

    // Wait for WebGPU to be ready
    if (!webgpu.isSupported || !webgpu.device) {
      if (webgpu.error) {
        setError(webgpu.error);
        setIsLoading(false);
      }
      return;
    }

    let mounted = true;

    async function initPipeline() {
      if (!canvasRef.current || !webgpu.device || !webgpu.gpuInfo) return;

      try {
        const device = webgpu.device;
        const canvas = canvasRef.current;
        const container = containerRef.current!;

        // Setup canvas context
        const context = canvas.getContext('webgpu');
        if (!context) {
          throw new Error('Failed to get WebGPU context');
        }

        const preferredFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
          device,
          format: preferredFormat,
          alphaMode: 'premultiplied',
        });

        // Initialize progressive loader
        const loader = new ProgressiveLoader();
        setLoadingStage(loader.getCurrentStage().description);

        // Determine initial quality based on GPU tier
        const gpuTier = detectGPUTier(webgpu.gpuInfo.vendor, webgpu.gpuInfo.architecture);
        const initialQuality = gpuTier === 'high' ? 'high' : gpuTier === 'medium' ? 'medium' : 'low';
        setQuality(initialQuality);

        // Create performance monitor
        const perfMonitor = new PerformanceMonitor(initialQuality, gpuTier);
        const qualityPreset = QualityPresets[initialQuality];

        // Get canvas dimensions
        const width = container.clientWidth;
        const height = container.clientHeight;
        canvas.width = width * qualityPreset.pixelRatio;
        canvas.height = height * qualityPreset.pixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        loader.nextStage();
        setLoadingStage(loader.getCurrentStage().description);
        setLoadingProgress(loader.getTotalProgress());

        // Create render pipeline
        const pipelineConfig: PipelineConfig = {
          width: canvas.width,
          height: canvas.height,
          pixelRatio: qualityPreset.pixelRatio,
          maxRaySteps: qualityPreset.rayMarchSteps,
          shadowSteps: qualityPreset.shadowSteps,
          enableCaustics: true,
          enableTAA: qualityPreset.useTAA,
        };

        const { pipeline, bindGroup, uniformBuffer } = await createRenderPipeline(device, pipelineConfig);

        if (!mounted) return;

        loader.nextStage();
        setLoadingStage(loader.getCurrentStage().description);
        setLoadingProgress(loader.getTotalProgress());

        // Create TAA accumulator
        const taa = qualityPreset.useTAA
          ? new TAAAccumulator(device, canvas.width, canvas.height, TAAPresets[initialQuality])
          : null;

        loader.nextStage();
        setLoadingStage(loader.getCurrentStage().description);
        setLoadingProgress(loader.getTotalProgress());

        // Create caustics renderer
        const caustics = new CausticsRenderer(device, CausticsPresets[initialQuality]);

        // For mobile/low-end, pre-bake caustics
        if (initialQuality === 'low' && CausticsPresets.low.bakingGrid) {
          await caustics.bakeCausticsGrid(CausticsPresets.low.bakingGrid, (progress) => {
            loader.updateProgress(progress);
            setLoadingProgress(loader.getTotalProgress());
          });
        }

        loader.nextStage();
        setLoadingStage(loader.getCurrentStage().description);
        setLoadingProgress(loader.getTotalProgress());

        // Store render state
        renderStateRef.current = {
          device,
          context,
          pipeline,
          bindGroup,
          uniformBuffer,
          performanceMonitor: perfMonitor,
          loader,
          taa,
          caustics,
          animationId: null,
          time: 0,
          cameraPosition: [15, 10, 15],
          cameraTarget: [0, 0, 0],
          interactionStartTime: new Map(),
        };

        loader.nextStage();
        loader.updateProgress(1);
        setLoadingProgress(1);
        setIsLoading(false);

        // Start render loop
        startRenderLoop();
      } catch (err) {
        console.error('WebGPU initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown initialization error');
        setIsLoading(false);
      }
    }

    initPipeline();

    return () => {
      mounted = false;
      if (renderStateRef.current?.animationId) {
        cancelAnimationFrame(renderStateRef.current.animationId);
      }
      if (renderStateRef.current?.taa) {
        renderStateRef.current.taa.destroy();
      }
      if (renderStateRef.current?.caustics) {
        renderStateRef.current.caustics.destroy();
      }
    };
  }, [webgpu.isSupported, webgpu.device, webgpu.error, webgpu.gpuInfo, mockWebGPU]);

  // Render loop
  const startRenderLoop = useCallback(() => {
    if (!renderStateRef.current) return;

    const render = () => {
      const state = renderStateRef.current;
      if (!state) return;

      // Record frame start
      const metrics = state.performanceMonitor.recordFrame();
      setFps(Math.round(metrics.fps));

      // Check if quality adjustment is needed
      const { shouldChange, newQuality } = state.performanceMonitor.shouldAdjustQuality();
      if (shouldChange && newQuality) {
        setQuality(newQuality.name);
        // Quality change would trigger re-initialization
      }

      // Update time
      state.time += 0.016; // ~60fps

      // Camera animation (smooth orbit with gyro influence)
      const baseAngle = state.time * 0.1;
      const gyroOffset = gyro.isGyroActive
        ? [(gyro.smoothedGamma / 90) * 5, (gyro.smoothedBeta / 180) * 3, 0]
        : [0, 0, 0];

      state.cameraPosition = [
        Math.cos(baseAngle) * 15 + gyroOffset[0],
        10 + gyroOffset[1],
        Math.sin(baseAngle) * 15 + gyroOffset[2],
      ];

      // If stage is selected, zoom to it
      if (selectedStage) {
        const stage = MANUFACTURING_STAGES.find(s => s.id === selectedStage);
        if (stage) {
          state.cameraTarget = stage.position;
        }
      } else {
        state.cameraTarget = [0, 0, 0];
      }

      // Get TAA jitter
      const jitter = state.taa ? state.taa.getJitter() : { x: 0, y: 0 };

      // Update uniforms
      const uniforms: SceneUniforms = {
        resolution: [canvasRef.current!.width, canvasRef.current!.height],
        time: state.time,
        cameraPosition: state.cameraPosition,
        cameraTarget: state.cameraTarget,
        cameraUp: [0, 1, 0],
        lightDirection: gyro.lightDirection,
        lightIntensity: gyro.causticsIntensity,
        fogColor: [0x0a / 255, 0x2e / 255, 0x2c / 255],
        fogDensity: 0.02,
      };

      // Write uniforms to buffer
      const uniformData = new Float32Array([
        ...uniforms.resolution, uniforms.time, 0, // padding
        ...uniforms.cameraPosition, 0,
        ...uniforms.cameraTarget, 0,
        ...uniforms.cameraUp, 0,
        ...uniforms.lightDirection, uniforms.lightIntensity,
        ...uniforms.fogColor, uniforms.fogDensity,
      ]);
      state.device.queue.writeBuffer(state.uniformBuffer, 0, uniformData);

      // Render frame
      const commandEncoder = state.device.createCommandEncoder();

      // Render caustics if enabled
      if (state.caustics) {
        state.caustics.render(commandEncoder, {
          lightDir: gyro.lightDirection,
          lightIntensity: gyro.causticsIntensity,
          time: state.time,
          ior: 1.52,
        });
      }

      // Main render pass
      const textureView = state.context.getCurrentTexture().createView();
      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
          view: textureView,
          clearValue: { r: 0x0a / 255, g: 0x2e / 255, b: 0x2c / 255, a: 1 },
          loadOp: 'clear' as GPULoadOp,
          storeOp: 'store' as GPUStoreOp,
        }],
      });

      renderPass.setPipeline(state.pipeline);
      renderPass.setBindGroup(0, state.bindGroup);
      renderPass.draw(3); // Full-screen triangle
      renderPass.end();

      state.device.queue.submit([commandEncoder.finish()]);

      // TAA accumulation
      if (state.taa) {
        state.taa.nextFrame();
      }

      state.animationId = requestAnimationFrame(render);
    };

    render();
  }, [gyro, selectedStage]);

  // Handle stage click
  const handleStageClick = useCallback((stageId: string) => {
    setSelectedStage(prev => prev === stageId ? null : stageId);

    if (renderStateRef.current) {
      const now = performance.now();
      const interactionMap = renderStateRef.current.interactionStartTime;

      if (interactionMap.has(stageId)) {
        // End interaction
        const duration = now - interactionMap.get(stageId)!;
        interactionMap.delete(stageId);

        if (onStageInteraction) {
          onStageInteraction(stageId, duration);
        }
      } else {
        // Start interaction
        interactionMap.set(stageId, now);
      }
    }

    if (onStageClick) {
      onStageClick(stageId);
    }
  }, [onStageClick, onStageInteraction]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current || !renderStateRef.current) return;

      const state = renderStateRef.current;
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const qualityPreset = state.performanceMonitor.getQuality();

      const width = container.clientWidth;
      const height = container.clientHeight;

      canvas.width = width * qualityPreset.pixelRatio;
      canvas.height = height * qualityPreset.pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Recreate TAA with new dimensions
      if (state.taa) {
        state.taa.resize(canvas.width, canvas.height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show fallback if WebGPU not supported
  if (!webgpu.isSupported && !mockWebGPU) {
    return <>{fallback}</>;
  }

  // Show error state
  if (error) {
    return (
      <div className={className} ref={containerRef}>
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm p-4">
          <div className="text-center">
            <div className="text-muted-foreground text-sm mb-2">
              WebGPU Rendering Error
            </div>
            <div className="text-xs text-muted-foreground/60">
              {error}
            </div>
            {fallback && <div className="mt-4">{fallback}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          opacity: isLoading ? 0.3 : 1,
          transition: 'opacity 0.5s ease-in-out',
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-primary animate-pulse mb-2">{loadingStage}</div>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${loadingProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Performance stats */}
      {!isLoading && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded">
          <div>FPS: {fps}</div>
          <div>Quality: {quality}</div>
          {gyro.isGyroActive && <div>Gyro: Active</div>}
        </div>
      )}

      {/* Manufacturing stages overlay */}
      {!isLoading && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {MANUFACTURING_STAGES.map(stage => (
            <button
              key={stage.id}
              onClick={() => handleStageClick(stage.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedStage === stage.id
                  ? 'bg-primary text-primary-foreground scale-110'
                  : 'bg-card/80 text-muted-foreground hover:bg-card'
              }`}
              style={{
                borderLeft: `3px solid ${stage.color}`,
              }}
            >
              {stage.name}
            </button>
          ))}
        </div>
      )}

      {/* Stage info panel */}
      {selectedStage && (
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm p-4 rounded-lg max-w-xs">
          {MANUFACTURING_STAGES.find(s => s.id === selectedStage) && (
            <>
              <h3 className="font-semibold mb-1">
                {MANUFACTURING_STAGES.find(s => s.id === selectedStage)!.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {MANUFACTURING_STAGES.find(s => s.id === selectedStage)!.description}
              </p>
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      {!isLoading && gyro.isGyroActive && (
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded">
          Tilt device to control lighting
        </div>
      )}
    </div>
  );
}
