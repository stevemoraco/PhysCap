import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoldButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline";
  className?: string;
  icon?: "arrow" | "sparkle" | "none";
  size?: "default" | "lg";
  disabled?: boolean;
  "data-testid"?: string;
}

export function GoldButton({ 
  children, 
  onClick, 
  variant = "primary", 
  className,
  icon = "arrow",
  size = "default",
  disabled = false,
  "data-testid": dataTestId
}: GoldButtonProps) {
  const IconComponent = icon === "arrow" ? ArrowRight : icon === "sparkle" ? Sparkles : null;
  
  if (variant === "outline") {
    return (
      <Button
        onClick={onClick}
        variant="outline"
        size={size}
        disabled={disabled}
        className={cn(
          "border-primary text-primary hover:bg-primary/10 backdrop-blur-sm",
          "shadow-lg shadow-primary/20 transition-all duration-300",
          "hover:shadow-xl hover:shadow-primary/30 hover:scale-105",
          "font-medium tracking-wide",
          size === "lg" && "px-8 py-6 text-lg",
          className
        )}
        data-testid={dataTestId || "button-cta-outline"}
      >
        {children}
        {IconComponent && <IconComponent className="ml-2 h-4 w-4" />}
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "bg-gradient-to-r from-primary via-[#e5c158] to-primary bg-size-200 animate-gradient",
        "text-primary-foreground font-semibold tracking-wide",
        "shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/60",
        "transition-all duration-300 hover:scale-105",
        "border border-primary-border",
        size === "lg" && "px-8 py-6 text-lg",
        className
      )}
      size={size}
      data-testid={dataTestId || "button-cta-primary"}
    >
      {children}
      {IconComponent && <IconComponent className="ml-2 h-4 w-4" />}
    </Button>
  );
}
