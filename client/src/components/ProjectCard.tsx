import { Card } from "@/components/ui/card";
import { GoldButton } from "./GoldButton";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  title: string;
  description: string;
  metrics?: { label: string; value: string; icon?: React.ReactNode }[];
  onLearnMore?: () => void;
  onExpressInterest?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function ProjectCard({
  title,
  description,
  metrics,
  onLearnMore,
  onExpressInterest,
  className,
  children,
}: ProjectCardProps) {
  return (
    <Card className={cn(
      "bg-card/80 backdrop-blur-sm border-primary/20",
      "p-8 space-y-6 hover-elevate transition-all duration-300",
      "relative overflow-hidden",
      className
    )}>
      {/* Gold accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      {/* Content */}
      <div className="space-y-4">
        <h3 className="font-serif text-3xl font-bold text-foreground relative inline-block">
          {title}
          <div className="absolute -bottom-2 left-0 h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>

        {children}

        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
            {metrics.map((metric, idx) => (
              <div key={idx} className="text-center" data-testid={`metric-${idx}`}>
                {metric.icon && (
                  <div className="flex justify-center mb-2 text-accent">
                    {metric.icon}
                  </div>
                )}
                <div className="text-2xl font-bold text-primary">{metric.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-4 pt-4">
        {onLearnMore && (
          <GoldButton 
            onClick={onLearnMore}
            variant="outline"
            className="flex-1"
          >
            Learn More
          </GoldButton>
        )}
        {onExpressInterest && (
          <GoldButton 
            onClick={onExpressInterest}
            className="flex-1"
          >
            Express Interest
          </GoldButton>
        )}
      </div>
    </Card>
  );
}
