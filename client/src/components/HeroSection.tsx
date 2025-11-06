import { useEffect, useState } from "react";
import { GoldButton } from "./GoldButton";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { ChevronDown, Gem } from "lucide-react";

export function HeroSection() {
  const { orientation } = useDeviceOrientation();
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (orientation.beta !== null && orientation.gamma !== null) {
      // Convert device orientation to parallax offset
      // Beta: front-back tilt (-180 to 180)
      // Gamma: left-right tilt (-90 to 90)
      const x = (orientation.gamma / 90) * 20; // Max 20px shift
      const y = (orientation.beta / 180) * 20;
      setParallaxOffset({ x, y });
    }
  }, [orientation]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Golden particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 text-center">
        {/* Logo with parallax */}
        <div
          className="mb-8 inline-block transition-transform duration-300 ease-out relative"
          style={{
            transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
          }}
        >
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center drop-shadow-2xl relative">
            <Gem className="w-16 h-16 md:w-20 md:h-20 text-primary-foreground animate-pulse" data-testid="img-logo-hero" />
            {/* Golden glow effect */}
            <div className="absolute inset-0 bg-primary/30 blur-3xl -z-10 animate-pulse rounded-2xl" />
          </div>
        </div>

        <h1 className="font-serif text-hero-mobile md:text-hero text-foreground mb-6 leading-tight">
          Transforming Vision
          <br />
          <span className="text-primary">Into Infrastructure</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
          Revolutionary projects powered by autonomous manufacturing, cutting-edge robotics, 
          and AI-driven innovation. From solar gigafactories to orbital habitats.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <GoldButton
            size="lg"
            onClick={() => {
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore Projects
          </GoldButton>
          <GoldButton
            size="lg"
            variant="outline"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started
          </GoldButton>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-primary" />
      </div>
    </section>
  );
}
