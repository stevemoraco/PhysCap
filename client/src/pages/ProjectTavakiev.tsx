import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { SolarManufacturing3D } from "@/components/SolarManufacturing3D";
import { GoldButton } from "@/components/GoldButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, DollarSign, Factory, TrendingUp, Share2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { FeedbackModal } from "@/components/FeedbackModal";
import { SocialShare } from "@/components/SocialShare";

export default function ProjectTavakiev() {
  const { user } = useAuth();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showShare, setShowShare] = useState(false);

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
              <h1 className="text-4xl font-bold text-foreground mb-2">Project Tavakiev</h1>
              <p className="text-xl text-muted-foreground">2 GW Autonomous Solar Gigafactory</p>
            </div>
            <div className="flex gap-2">
              <GoldButton variant="outline" onClick={() => setShowShare(true)} data-testid="button-share-project">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </GoldButton>
              <GoldButton onClick={() => setShowFeedback(true)} data-testid="button-provide-feedback">
                Provide Feedback
              </GoldButton>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary">Solar Manufacturing</Badge>
            <Badge variant="secondary">2 GW Capacity</Badge>
            <Badge variant="secondary">IRA Tax Credits</Badge>
            <Badge variant="secondary">Autonomous Production</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-primary">3D Factory Visualization</h2>
            <div className="h-96 rounded-lg overflow-hidden border border-primary/20">
              <SolarManufacturing3D className="w-full h-full" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Interactive 3D model of the autonomous solar panel manufacturing facility. Click on panels and robots to explore.
            </p>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Project Overview
              </h3>
              <p className="text-muted-foreground mb-4">
                Project Tavakiev represents a revolutionary approach to solar panel manufacturing through unprecedented integration of IRA tax credit stacking, achieving 100x cost reduction in solar production.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary">2 GW</div>
                  <div className="text-sm text-muted-foreground">Annual Capacity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">100x</div>
                  <div className="text-sm text-muted-foreground">Cost Reduction</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">95%</div>
                  <div className="text-sm text-muted-foreground">Automation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">$850M</div>
                  <div className="text-sm text-muted-foreground">Project Value</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Financial Highlights
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Manufacturing Tax Credit (45X)</span>
                  <span className="font-semibold">$420M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment Tax Credit (48C)</span>
                  <span className="font-semibold">$185M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Energy Community Bonus</span>
                  <span className="font-semibold">$95M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domestic Content Bonus</span>
                  <span className="font-semibold">$150M</span>
                </div>
                <div className="h-px bg-border my-2"></div>
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-foreground">Total Tax Credits</span>
                  <span className="text-primary">$850M</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <Factory className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Advanced Manufacturing</h3>
            <p className="text-sm text-muted-foreground">
              Cutting-edge robotic assembly lines with AI-powered quality control
            </p>
          </Card>

          <Card className="p-6">
            <TrendingUp className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold mb-2">Scalable Production</h3>
            <p className="text-sm text-muted-foreground">
              Modular design enables rapid expansion to 10 GW+ capacity
            </p>
          </Card>

          <Card className="p-6">
            <Zap className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">High Efficiency</h3>
            <p className="text-sm text-muted-foreground">
              24.5% efficiency panels with advanced cell technology
            </p>
          </Card>

          <Card className="p-6">
            <DollarSign className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold mb-2">Cost Leadership</h3>
            <p className="text-sm text-muted-foreground">
              Sub-$0.10/watt production cost through tax credit optimization
            </p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-6">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-primary">Production Capacity</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 2 GW annual solar panel output</li>
                <li>• 5 million panels per year</li>
                <li>• 24/7 autonomous operation</li>
                <li>• 400W average panel power</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-primary">Technology Stack</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• PERC+ solar cell technology</li>
                <li>• Automated optical inspection</li>
                <li>• AI-driven yield optimization</li>
                <li>• Robotic material handling</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-primary">Facility Details</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 500,000 sq ft manufacturing space</li>
                <li>• ISO Class 6 cleanroom environment</li>
                <li>• 50 MW dedicated power supply</li>
                <li>• Zero-emission operations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-primary">Timeline</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Q1 2025: Site acquisition</li>
                <li>• Q3 2025: Construction start</li>
                <li>• Q2 2026: Production ramp-up</li>
                <li>• Q4 2026: Full capacity</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Interested in learning more about Project Tavakiev?
          </p>
          <GoldButton onClick={() => setShowFeedback(true)} data-testid="button-get-involved">
            Get Involved
          </GoldButton>
        </div>
      </div>

      <FeedbackModal
        open={showFeedback}
        onOpenChange={setShowFeedback}
        projectId="tavakiev"
        projectName="Project Tavakiev"
      />

      {showShare && (
        <SocialShare
          title="Project Tavakiev"
          description="2 GW autonomous solar gigafactory achieving 100x cost reduction through IRA tax credit stacking"
          projectId="tavakiev"
        />
      )}
    </div>
  );
}
