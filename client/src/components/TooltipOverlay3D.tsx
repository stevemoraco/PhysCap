import { X } from "lucide-react";
import type { TooltipInfo } from "@/hooks/use3DInteraction";

interface TooltipOverlay3DProps {
  tooltip: TooltipInfo;
  onClose: () => void;
}

export function TooltipOverlay3D({ tooltip, onClose }: TooltipOverlay3DProps) {
  return (
    <div
      className="absolute bg-card border border-primary/20 rounded-lg shadow-2xl p-3 max-w-xs pointer-events-auto z-10"
      style={{
        left: `${tooltip.position.x}px`,
        top: `${tooltip.position.y}px`,
        transform: 'translate(-50%, calc(-100% - 12px))',
      }}
      data-testid="tooltip-3d-info"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-semibold text-primary" data-testid="tooltip-3d-label">
          {tooltip.label}
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-close-tooltip"
          aria-label="Close tooltip"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground" data-testid="tooltip-3d-description">
        {tooltip.description}
      </p>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-card/95" />
      </div>
    </div>
  );
}
