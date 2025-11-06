import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { ProjectTavakiev } from "@/components/ProjectTavakiev";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { InnovationsSection } from "@/components/InnovationsSection";
import { GoldButton } from "@/components/GoldButton";
import { GyroscopePermission } from "@/components/GyroscopePermission";
import { SEOHead } from "@/components/SEOHead";

export default function Landing() {
  const [gyroPermissionGranted, setGyroPermissionGranted] = useState(false);

  useEffect(() => {
    // Track page visit
    const startTime = Date.now();
    
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      console.log(`Landing page visit duration: ${duration}s`);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead 
        title="Physical.Capital - GPU-Accelerated Infrastructure Investment Platform"
        description="Explore cutting-edge infrastructure projects with interactive 3D visualizations: 2 GW solar gigafactory, Colorado luxury resorts, world's tallest skyscraper, and orbital apartments. Mobile-first with gyroscope controls."
        keywords={[
          "infrastructure investment",
          "3D project visualization",
          "solar gigafactory",
          "Tabeguache resort",
          "Venustas Tower",
          "orbital apartments",
          "gyroscope visualization",
          "GPU accelerated 3D",
          "Physical Capital",
          "Colorado infrastructure"
        ]}
      />
      <GyroscopePermission onPermissionGranted={() => setGyroPermissionGranted(true)} />
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="relative">
        {/* Featured Project: Tavakiev */}
        <section className="py-24 bg-gradient-to-b from-background to-card/20" id="projects">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Featured <span className="text-primary">Project</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Leading the American solar renaissance with autonomous manufacturing
              </p>
            </div>

            <ProjectTavakiev />
          </div>
        </section>

        {/* Other Projects */}
        <section className="py-24 bg-card/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Additional <span className="text-primary">Ventures</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transformative infrastructure projects across multiple sectors
              </p>
            </div>

            <ProjectShowcase />
          </div>
        </section>

        {/* Core Innovations */}
        <InnovationsSection />

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-b from-card/30 to-background relative overflow-hidden">
          {/* Golden particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full opacity-10 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Build the Future?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              Join us in transforming vision into infrastructure. Sign in to access personalized 
              project insights and investment opportunities.
            </p>
            <GoldButton
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              icon="sparkle"
            >
              Get Started Today
            </GoldButton>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-12 bg-card/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Physical.Capital. Building tomorrow's infrastructure, today.
          </p>
        </div>
      </footer>
    </div>
  );
}
