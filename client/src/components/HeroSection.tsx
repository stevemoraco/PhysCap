import { useEffect, useState } from "react";
import { GoldButton } from "./GoldButton";
import { GlimmerEffect } from "./GlimmerEffect";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { ChevronDown, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { usePersonalization } from "@/hooks/usePersonalization";
import { useAuth } from "@/hooks/useAuth";

export function HeroSection() {
  const { orientation } = useDeviceOrientation();
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const { profile, getPersonalizedText } = usePersonalization();
  const { user } = useAuth();

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

  const baseSubtitle = profile
    ? `Your ${profile.expertiseTags?.slice(0, 2).join(" & ") || "cross-disciplinary"} expertise accelerates our autonomous infrastructure buildout.`
    : "Revolutionary projects powered by autonomous manufacturing, cutting-edge robotics, and AI-driven innovation. From solar gigafactories to orbital habitats.";
  const subtitle = getPersonalizedText("hero.subtitle", baseSubtitle);
  const primaryCta = getPersonalizedText("hero.cta", "Explore Projects");
  const secondaryCta = getPersonalizedText("hero.ctaSecondary", "Get Started");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Gyroscope-responsive glimmer particles (gold, emerald, diamond) */}
      <GlimmerEffect particleCount={40} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 text-center">
        {/* Logo with parallax */}
        <div
          className="mb-8 inline-block transition-transform duration-300 ease-out relative"
          style={{
            transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
          }}
        >
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center drop-shadow-2xl relative overflow-hidden">
            <img
              src={BRAND.logoSrc}
              alt={BRAND.logoAlt}
              className="h-24 w-24 md:h-28 md:w-28 object-contain animate-pulse"
              data-testid="img-logo-hero"
            />
            {/* Golden glow effect */}
            <div className="absolute inset-0 bg-primary/30 blur-3xl -z-10 animate-pulse rounded-2xl" />
          </div>
        </div>

        {profile && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs text-primary shadow-lg shadow-primary/10 backdrop-blur">
            <Sparkles className="h-3 w-3" />
            {getPersonalizedText(
              "hero.ribbon",
              `Welcome ${user?.firstName ?? "back"} — prioritizing ${profile.expertiseTags?.slice(0, 1).join(" & ") || "your focus"} tracks today.`,
            )}
          </div>
        )}

        <h1 className="font-serif text-hero-mobile md:text-hero text-foreground mb-6 leading-tight">
          Transforming Vision
          <br />
          <span className="text-primary">Into Infrastructure</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <GoldButton
            size="lg"
            onClick={() => {
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {primaryCta}
          </GoldButton>
          <GoldButton
            size="lg"
            variant="outline"
            onClick={() => window.location.href = '/api/login'}
          >
            {secondaryCta}
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
