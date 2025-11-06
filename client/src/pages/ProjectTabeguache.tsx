import { Navigation } from "@/components/Navigation";
import { TabeguacheResort3D } from "@/components/TabeguacheResort3D";
import { GoldButton } from "@/components/GoldButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, ArrowLeft, Mountain, TrendingUp, Users, Calendar, MapPin, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { FeedbackModal } from "@/components/FeedbackModal";
import { SocialShare } from "@/components/SocialShare";

const SEASONS = [
  { id: 'Q1', name: 'Winter', color: '#4169e1', visitors: 45000 },
  { id: 'Q2', name: 'Spring', color: '#50c878', visitors: 38000 },
  { id: 'Q3', name: 'Summer', color: '#d4af37', visitors: 62000 },
  { id: 'Q4', name: 'Fall', color: '#ff8c00', visitors: 71000 },
];

const AMENITIES = [
  { id: 'lodge', name: 'Main Lodge', icon: '🏨', description: 'Luxury accommodations with panoramic mountain views' },
  { id: 'golf', name: 'Championship Golf', icon: '⛳', description: 'Jim McLean signature 18-hole course' },
  { id: 'spa', name: 'Wellness Spa', icon: '💆', description: 'World-class treatments and thermal springs' },
  { id: 'museum', name: 'Art Museum', icon: '🎨', description: 'Contemporary Western art collection' },
  { id: 'restaurant', name: 'Fine Dining', icon: '🍷', description: 'Award-winning regional cuisine' },
  { id: 'canyons', name: 'Canyon Tours', icon: '🏔️', description: 'Guided exploration of red rock formations' },
];

export default function ProjectTabeguache() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeSeason, setActiveSeason] = useState(0);
  const [selectedAmenity, setSelectedAmenity] = useState<string | null>(null);
  const visualizationRef = useRef<HTMLDivElement>(null);

  // Auto-rotate seasons
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSeason((prev) => (prev + 1) % SEASONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollToVisualization = () => {
    visualizationRef.current?.scrollIntoView({ behavior: 'smooth' });
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

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">The Tabeguache Collection</h1>
              <p className="text-xl text-muted-foreground">Colorado Luxury Resort & Real Estate Portfolio</p>
            </div>
            <div className="flex gap-2">
              <GoldButton variant="outline" onClick={() => setShowShare(true)} data-testid="button-share-project">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </GoldButton>
              <GoldButton onClick={() => setShowFeedback(true)} data-testid="button-provide-feedback">
                Investment Inquiry
              </GoldButton>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary">Hospitality</Badge>
            <Badge variant="secondary">Real Estate</Badge>
            <Badge variant="secondary">Record Revenue Growth</Badge>
            <Badge variant="secondary">Colorado Springs</Badge>
          </div>
        </div>

        {/* 3D Resort Visualization */}
        <Card className="p-6 mb-8" ref={visualizationRef}>
          <div className="flex flex-wrap items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-primary">Resort Campus Visualization</h2>
            <Badge variant="outline" className="text-sm">Interactive 3D Model</Badge>
          </div>
          <div className="h-[500px] rounded-lg overflow-hidden border border-primary/20 mb-4">
            <TabeguacheResort3D className="w-full h-full" />
          </div>
          <p className="text-sm text-muted-foreground">
            Explore our 450-acre resort campus featuring the main lodge, guest cabins, championship golf course, and luxury spa facilities.
          </p>
        </Card>

        {/* Tourism Heatmap */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent" />
            Visitor Density by Season
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {SEASONS.map((season, idx) => (
              <div
                key={season.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  activeSeason === idx
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-border hover:border-primary/50'
                }`}
                style={{
                  background: activeSeason === idx ? `linear-gradient(135deg, ${season.color}20, ${season.color}10)` : 'transparent',
                }}
                onClick={() => setActiveSeason(idx)}
                data-testid={`season-${season.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{season.name}</span>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: season.color }}
                  ></div>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {season.visitors.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Visitors</div>
              </div>
            ))}
          </div>

          {/* Animated heatmap bars */}
          <div className="space-y-3">
            {SEASONS.map((season, idx) => (
              <div key={season.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{season.name} {season.id}</span>
                  <span className="font-semibold">{season.visitors.toLocaleString()} visitors</span>
                </div>
                <div className="h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-1000 flex items-center justify-end pr-3"
                    style={{
                      width: `${(season.visitors / 71000) * 100}%`,
                      backgroundColor: season.color,
                      opacity: activeSeason === idx ? 1 : 0.6,
                    }}
                  >
                    {activeSeason === idx && (
                      <span className="text-white text-sm font-semibold animate-pulse">
                        Active Season
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Record-Breaking Performance */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            Record-Breaking Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center">
                <span className="mr-2">$</span>
                <span className="tabular-nums">42</span>
                <span className="text-2xl">M</span>
              </div>
              <div className="text-sm text-muted-foreground mb-1">Q4 2024 Revenue</div>
              <Badge variant="default" className="bg-accent">+28% YoY</Badge>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2 flex items-center justify-center">
                <span className="tabular-nums">150</span>
                <span className="text-2xl">%</span>
              </div>
              <div className="text-sm text-muted-foreground mb-1">Luxury Segment Growth</div>
              <Badge variant="outline">Premier Suites</Badge>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center">
                <span className="tabular-nums">216K</span>
              </div>
              <div className="text-sm text-muted-foreground mb-1">Annual Visitors (2024)</div>
              <Badge variant="default">Record High</Badge>
            </div>
          </div>
        </Card>

        {/* Amenities Grid */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            World-Class Amenities
          </h2>
          <p className="text-muted-foreground mb-6">
            Click any amenity to explore its location on the resort campus
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {AMENITIES.map((amenity) => (
              <button
                key={amenity.id}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-lg ${
                  selectedAmenity === amenity.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => {
                  setSelectedAmenity(amenity.id);
                  scrollToVisualization();
                }}
                data-testid={`amenity-${amenity.id}`}
              >
                <div className="text-4xl mb-2">{amenity.icon}</div>
                <h3 className="font-semibold text-foreground mb-1">{amenity.name}</h3>
                <p className="text-xs text-muted-foreground">{amenity.description}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Investment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Market Position
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Regional Market Share</div>
                <div className="text-2xl font-bold text-primary">34%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Average Daily Rate (ADR)</div>
                <div className="text-2xl font-bold text-accent">$485</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Occupancy Rate</div>
                <div className="text-2xl font-bold text-primary">78%</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Development Pipeline
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Badge variant="default" className="mt-1">2025</Badge>
                <div>
                  <div className="font-semibold text-sm">Phase 2 Expansion</div>
                  <div className="text-xs text-muted-foreground">50 additional luxury villas</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">2026</Badge>
                <div>
                  <div className="font-semibold text-sm">Wellness Center</div>
                  <div className="text-xs text-muted-foreground">40,000 sq ft medical spa</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">2027</Badge>
                <div>
                  <div className="font-semibold text-sm">Conference Center</div>
                  <div className="text-xs text-muted-foreground">MICE facilities for 1,000+ guests</div>
                </div>
              </li>
            </ul>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="p-8 text-center bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <Mountain className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Experience The Collection</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Visit our award-winning resort or explore investment opportunities in Colorado's premier luxury hospitality portfolio.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <GoldButton onClick={() => setShowFeedback(true)} data-testid="button-investment-overview">
              Request Investment Overview
            </GoldButton>
            <GoldButton
              variant="outline"
              onClick={() => window.open('https://tabeguachecollection.com', '_blank')}
              data-testid="button-visit-resort"
            >
              Visit Resort Website
            </GoldButton>
          </div>
        </Card>
      </div>

      <FeedbackModal
        open={showFeedback}
        onOpenChange={setShowFeedback}
        projectId="tabeguache"
        projectName="The Tabeguache Collection"
      />

      {showShare && (
        <SocialShare
          title="The Tabeguache Collection"
          description="Colorado's premier luxury resort achieving record 150% growth in luxury segment"
          projectId="tabeguache"
        />
      )}
    </div>
  );
}
