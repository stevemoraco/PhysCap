import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CreditLayer {
  id: string;
  name: string;
  amount: number;
  color: string;
  description: string;
  perUnit: string;
}

interface FinancialStackProps {
  layers: CreditLayer[];
  totalCredits: number;
  comparisonPrice?: number;
  comparisonLabel?: string;
  onInteraction?: (type: string, context: any) => void;
}

export function FinancialStack({
  layers,
  totalCredits,
  comparisonPrice,
  comparisonLabel,
  onInteraction,
}: FinancialStackProps) {
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const handleLayerClick = (layer: CreditLayer) => {
    setSelectedLayer(selectedLayer === layer.id ? null : layer.id);
    onInteraction?.('financial_layer_click', {
      layerId: layer.id,
      layerName: layer.name,
      amount: layer.amount,
    });
  };

  const maxAmount = Math.max(...layers.map((l) => l.amount));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            IRA Tax Credit Stacking
          </h3>
          <p className="text-muted-foreground mt-1">45X Manufacturing Credits Breakdown</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">${totalCredits.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Total per Watt</div>
        </div>
      </div>

      {/* Stacked visualization */}
      <Card className="p-6">
        <div className="space-y-3">
          {layers.map((layer, index) => {
            const isHovered = hoveredLayer === layer.id;
            const isSelected = selectedLayer === layer.id;
            const widthPercentage = (layer.amount / maxAmount) * 100;

            return (
              <div key={layer.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: layer.color }}
                    ></div>
                    <span className="font-medium text-foreground">{layer.name}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{layer.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{layer.perUnit}</span>
                    <span className="font-bold text-foreground">
                      ${layer.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div
                  className={`relative h-10 rounded-lg cursor-pointer transition-all duration-300 ${
                    isHovered || isSelected ? 'shadow-lg scale-[1.02]' : ''
                  }`}
                  style={{
                    backgroundColor: layer.color,
                    width: `${widthPercentage}%`,
                    minWidth: '20%',
                    opacity: isHovered || isSelected ? 1 : 0.85,
                  }}
                  onMouseEnter={() => setHoveredLayer(layer.id)}
                  onMouseLeave={() => setHoveredLayer(null)}
                  onClick={() => handleLayerClick(layer)}
                  data-testid={`financial-layer-${layer.id}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm drop-shadow-md">
                      ${layer.amount.toFixed(2)}
                    </span>
                  </div>

                  {/* Animated shine effect on hover */}
                  {isHovered && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
                  )}
                </div>

                {/* Expanded details */}
                {isSelected && (
                  <Card className="p-4 bg-card/50 border-l-4 animate-in slide-in-from-top-2" style={{ borderLeftColor: layer.color }}>
                    <p className="text-sm text-muted-foreground">{layer.description}</p>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Per Unit:</span>
                        <span className="ml-2 font-semibold">{layer.perUnit}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="ml-2 font-semibold">${layer.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            );
          })}
        </div>

        {/* Total bar */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-foreground">Total Tax Credits</span>
            <span className="text-2xl font-bold text-primary">${totalCredits.toFixed(2)}</span>
          </div>
          <div className="h-12 rounded-lg bg-gradient-to-r from-primary via-accent to-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-bold">${totalCredits.toFixed(2)} per Watt</span>
          </div>
        </div>
      </Card>

      {/* Comparison */}
      {comparisonPrice && comparisonLabel && (
        <Card className="p-6 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">{comparisonLabel}</div>
              <div className="text-2xl font-bold text-foreground">${comparisonPrice.toFixed(2)}</div>
            </div>
            <Badge variant="outline" className="text-accent border-accent">
              {totalCredits > comparisonPrice ? '+' : ''}
              {((totalCredits / comparisonPrice - 1) * 100).toFixed(1)}%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Our tax credit optimization provides{' '}
            <span className="font-semibold text-foreground">
              ${(totalCredits - comparisonPrice).toFixed(2)}
            </span>{' '}
            more value per watt compared to {comparisonLabel.toLowerCase()}.
          </p>
        </Card>
      )}
    </div>
  );
}
