import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

interface InteractionHeatmapProps {
  data: Array<{
    id: string;
    userId: string;
    pagePath: string;
    sectionId?: string;
    interactionType: string;
    duration?: number;
    timestamp: string;
  }>;
}

export function InteractionHeatmap({ data }: InteractionHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Group interactions by page and section
    const grouped = data.reduce((acc, interaction) => {
      const key = `${interaction.pagePath}${interaction.sectionId ? `-${interaction.sectionId}` : ''}`;
      if (!acc[key]) {
        acc[key] = {
          pagePath: interaction.pagePath,
          sectionId: interaction.sectionId,
          count: 0,
          totalDuration: 0,
          types: {} as Record<string, number>,
        };
      }
      acc[key].count++;
      acc[key].totalDuration += interaction.duration || 0;
      acc[key].types[interaction.interactionType] = (acc[key].types[interaction.interactionType] || 0) + 1;
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by count
    return Object.values(grouped).sort((a: any, b: any) => b.count - a.count);
  }, [data]);

  const maxCount = Math.max(...heatmapData.map((d: any) => d.count), 1);

  const getHeatColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.7) return 'bg-red-500';
    if (intensity > 0.4) return 'bg-orange-500';
    if (intensity > 0.2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">No interaction data available</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {heatmapData.slice(0, 12).map((item: any, index: number) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">{item.pagePath}</Badge>
              <div className={`h-4 w-4 rounded-full ${getHeatColor(item.count)}`} />
            </div>

            {item.sectionId && (
              <div className="text-sm text-muted-foreground mb-2">Section: {item.sectionId}</div>
            )}

            <div className="space-y-1">
              <div className="text-2xl font-bold">{item.count}</div>
              <div className="text-sm text-muted-foreground">interactions</div>

              {item.totalDuration > 0 && (
                <div className="text-xs text-muted-foreground">
                  Avg. Duration: {Math.round(item.totalDuration / item.count)}s
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(item.types).map(([type, count]: [string, any]) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}: {count}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      {heatmapData.length > 12 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing top 12 of {heatmapData.length} interaction points
        </div>
      )}
    </div>
  );
}
