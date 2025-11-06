import { Navigation } from "@/components/Navigation";
import { YadilhilOrbital3D } from "@/components/YadilhilOrbital3D";
import { GoldButton } from "@/components/GoldButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, ArrowLeft, Rocket, Globe, Orbit } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { FeedbackModal } from "@/components/FeedbackModal";
import { SocialShare } from "@/components/SocialShare";

export default function ProjectYadilhil() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [orbitPosition, setOrbitPosition] = useState(0);
  const [launchProgress, setLaunchProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrbitPosition((prev) => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const startLaunchSequence = () => {
    let progress = 0;
    const launchInterval = setInterval(() => {
      progress += 2;
      setLaunchProgress(progress);
      if (progress >= 100) {
        clearInterval(launchInterval);
        setTimeout(() => setLaunchProgress(0), 2000);
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Yádiłhił Orbital Complex</h1>
              <p className="text-xl text-muted-foreground">First Commercial Orbital Apartments</p>
            </div>
            <div className="flex gap-2">
              <GoldButton variant="outline" onClick={() => setShowShare(true)} data-testid="button-share-project">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </GoldButton>
              <GoldButton onClick={() => setShowFeedback(true)} data-testid="button-provide-feedback">
                Join Waitlist
              </GoldButton>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary">LEO Orbit</Badge>
            <Badge variant="secondary">400km Altitude</Badge>
            <Badge variant="secondary">Starship Launch</Badge>
            <Badge variant="secondary">Artificial Gravity</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-primary">Orbital Visualization</h2>
              <Badge variant="outline">Orbit Position: {orbitPosition.toFixed(0)}°</Badge>
            </div>
            <div className="h-[500px] rounded-lg overflow-hidden border border-primary/20 bg-black">
              <YadilhilOrbital3D className="w-full h-full" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Live orbital mechanics simulation showing the rotating torus habitat and Earth below.
            </p>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Orbit className="w-5 h-5 text-primary" />
                Project Overview
              </h3>
              <p className="text-muted-foreground mb-4">
                Yádiłhił (Navajo for "turning sky") is humanity's first commercial orbital habitat, manufactured in Colorado and launched via SpaceX Starship.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary">400km</div>
                  <div className="text-sm text-muted-foreground">Orbital Altitude</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">100</div>
                  <div className="text-sm text-muted-foreground">Residents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">0.3g</div>
                  <div className="text-sm text-muted-foreground">Artificial Gravity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">$12B</div>
                  <div className="text-sm text-muted-foreground">Project Value</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" />
                Window to Earth
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Unparalleled views of Earth from 400km altitude, completing one orbit every 90 minutes.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 360° panoramic windows in every unit</li>
                <li>• See 16 sunrises/sunsets daily</li>
                <li>• Aurora borealis at eye level</li>
                <li>• Live Earth observation suite</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Launch Sequence
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Colorado Fab → Assembly → Starship</span>
                  <span className="font-semibold">{launchProgress}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
                    style={{ width: `${launchProgress}%` }}
                  ></div>
                </div>
                <GoldButton
                  size="sm"
                  onClick={startLaunchSequence}
                  disabled={launchProgress > 0}
                  data-testid="button-launch-sequence"
                >
                  {launchProgress > 0 ? 'Launching...' : 'Simulate Launch'}
                </GoldButton>
              </div>
            </Card>
          </div>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-primary">Habitat Structure</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Rotating torus: 180m diameter</li>
                <li>• 2 RPM rotation for 0.3g gravity</li>
                <li>• Modular assembly in orbit</li>
                <li>• Meteoroid shielding: 10cm Whipple</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-primary">Life Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Closed-loop water recycling (98%)</li>
                <li>• Algae-based O₂ generation</li>
                <li>• Hydroponic food production</li>
                <li>• 6-month supply redundancy</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-primary">Transportation</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• SpaceX Starship crew transfers</li>
                <li>• 90-day rotation schedule</li>
                <li>• Cargo resupply every 30 days</li>
                <li>• Emergency return pods ready</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-8 text-center bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <Rocket className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Reserve Your Orbital Residence</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Be among the first 100 humans to call space home. Pre-sales launching 2026.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <GoldButton onClick={() => setShowFeedback(true)} data-testid="button-join-waitlist">
              Join Waitlist
            </GoldButton>
            <GoldButton variant="outline" data-testid="button-download-specs">
              Download Technical Specs
            </GoldButton>
          </div>
        </Card>
      </div>

      <FeedbackModal
        open={showFeedback}
        onOpenChange={setShowFeedback}
        projectId="yadilhil"
        projectName="Yádiłhił Orbital Complex"
      />

      {showShare && (
        <SocialShare
          title="Yádiłhił Orbital Complex"
          description="First commercial orbital apartments at 400km altitude with artificial gravity"
          projectId="yadilhil"
        />
      )}
    </div>
  );
}
