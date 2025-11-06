import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InnovationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export function InnovationCard({ title, description, icon, className }: InnovationCardProps) {
  return (
    <Card className={cn(
      "p-6 bg-card/60 backdrop-blur-sm border-primary/10",
      "hover-elevate transition-all duration-300",
      "relative overflow-hidden group",
      className
    )}>
      {/* Subtle leather texture overlay */}
      <div className="absolute inset-0 bg-[url('/leather-texture.jpg')] opacity-5 mix-blend-overlay pointer-events-none" />
      
      {/* Golden glow on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      
      <div className="relative space-y-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        
        <h4 className="font-serif text-xl font-semibold text-foreground">
          {title}
        </h4>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
}
