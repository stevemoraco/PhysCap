import { Navigation } from "@/components/Navigation";
import { VenustasTower3D } from "@/components/VenustasTower3D";
import { GoldButton } from "@/components/GoldButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, ArrowLeft, Building2, Wind, Trees } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { FeedbackModal } from "@/components/FeedbackModal";
import { SocialShare } from "@/components/SocialShare";

export default function ProjectVenustas() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [floorLevel, setFloorLevel] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercentage = element.scrollTop / (element.scrollHeight - element.clientHeight);
    setFloorLevel(Math.floor(scrollPercentage * 200)); // 200 floors
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
              <h1 className="text-4xl font-bold text-foreground mb-2">Venustas Tower</h1>
              <p className="text-xl text-muted-foreground">World's Tallest Skyscraper with Hanging Gardens</p>
            </div>
            <div className="flex gap-2">
              <GoldButton variant="outline" onClick={() => setShowShare(true)} data-testid="button-share-project">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </GoldButton>
              <GoldButton onClick={() => setShowFeedback(true)} data-testid="button-provide-feedback">
                Reserve Residence
              </GoldButton>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary">1,200m Height</Badge>
            <Badge variant="secondary">200 Floors</Badge>
            <Badge variant="secondary">Exterior Staircase</Badge>
            <Badge variant="secondary">Vertical Gardens</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-primary">Scrollable Tower</h2>
              <Badge variant="outline">Floor {floorLevel}/200</Badge>
            </div>
            <div
              className="h-[600px] overflow-y-auto rounded-lg border border-primary/20"
              onScroll={handleScroll}
              data-testid="tower-scroll-container"
            >
              <VenustasTower3D className="w-full h-full" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Scroll to explore the tower floor by floor. Hanging gardens appear every 10 floors.
            </p>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Project Overview
              </h3>
              <p className="text-muted-foreground mb-4">
                Venustas Tower redefines vertical living with its revolutionary exterior staircase and integrated vertical forest ecosystem.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary">1,200m</div>
                  <div className="text-sm text-muted-foreground">Total Height</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">200</div>
                  <div className="text-sm text-muted-foreground">Floors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">15k</div>
                  <div className="text-sm text-muted-foreground">Residents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">$8.5B</div>
                  <div className="text-sm text-muted-foreground">Project Value</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Trees className="w-5 h-5 text-accent" />
                Hanging Gardens
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                20 sky gardens integrated throughout the tower, each spanning 3 floors with over 10,000 plants and trees.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Automated irrigation & climate control</li>
                <li>• Native species promoting biodiversity</li>
                <li>• CO₂ absorption: 500 tons/year</li>
                <li>• Natural cooling reduces HVAC by 30%</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Wind className="w-5 h-5 text-primary" />
                Engineering Marvel
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Mega-braced core structural system</li>
                <li>• Wind load capacity: 250 km/h gusts</li>
                <li>• Tuned mass damper at peak</li>
                <li>• 12km exterior staircase for emergency egress</li>
              </ul>
            </Card>
          </div>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Height Comparison</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="h-32 bg-muted rounded flex items-end justify-center p-2">
                <div className="w-12 bg-primary rounded-t" style={{ height: '70%' }}></div>
              </div>
              <div className="mt-2 font-semibold text-sm">Burj Khalifa</div>
              <div className="text-xs text-muted-foreground">828m</div>
            </div>
            <div className="text-center">
              <div className="h-32 bg-muted rounded flex items-end justify-center p-2">
                <div className="w-12 bg-accent rounded-t" style={{ height: '100%' }}></div>
              </div>
              <div className="mt-2 font-semibold text-sm">Venustas Tower</div>
              <div className="text-xs text-muted-foreground">1,200m</div>
            </div>
            <div className="text-center">
              <div className="h-32 bg-muted rounded flex items-end justify-center p-2">
                <div className="w-12 bg-muted-foreground rounded-t" style={{ height: '60%' }}></div>
              </div>
              <div className="mt-2 font-semibold text-sm">Shanghai Tower</div>
              <div className="text-xs text-muted-foreground">632m</div>
            </div>
            <div className="text-center">
              <div className="h-32 bg-muted rounded flex items-end justify-center p-2">
                <div className="w-12 bg-muted-foreground rounded-t" style={{ height: '55%' }}></div>
              </div>
              <div className="mt-2 font-semibold text-sm">One World Trade</div>
              <div className="text-xs text-muted-foreground">541m</div>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Interested in reserving a residence in Venustas Tower?
          </p>
          <GoldButton onClick={() => setShowFeedback(true)} data-testid="button-reserve-residence">
            Reserve Your Sky Home
          </GoldButton>
        </div>
      </div>

      <FeedbackModal
        open={showFeedback}
        onOpenChange={setShowFeedback}
        projectId="venustas"
        projectName="Venustas Tower"
      />

      {showShare && (
        <SocialShare
          title="Venustas Tower"
          description="World's tallest skyscraper at 1,200m with revolutionary hanging gardens"
          projectId="venustas"
        />
      )}
    </div>
  );
}
