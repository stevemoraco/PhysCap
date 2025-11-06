import { Navigation } from "@/components/Navigation";
import { GoldButton } from "@/components/GoldButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Truck, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function InnovationGoldenSpike() {
  const [truckPosition, setTruckPosition] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTruckPosition((prev) => {
        if (prev >= 100) {
          setIsRunning(false);
          return 0;
        }
        return prev + 0.5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Golden Spike Autonomous Logistics</h1>
          <p className="text-xl text-muted-foreground">I-25 Corridor Autonomous Freight Network</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary">Autonomous Trucks</Badge>
            <Badge variant="secondary">24/7 Operation</Badge>
            <Badge variant="secondary">45% Cost Reduction</Badge>
          </div>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">I-25 Corridor Map</h2>
          <div className="relative h-96 bg-gradient-to-b from-slate-700 to-slate-900 rounded-lg overflow-hidden">
            {/* Simple SVG corridor map */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
              {/* Corridor line */}
              <line x1="200" y1="50" x2="200" y2="350" stroke="#d4af37" strokeWidth="4" strokeDasharray="10,5" />
              {/* Cities */}
              <circle cx="200" cy="80" r="8" fill="#50c878" />
              <text x="220" y="85" fill="white" fontSize="12">Denver</text>
              <circle cx="200" cy="160" r="8" fill="#50c878" />
              <text x="220" y="165" fill="white" fontSize="12">Colorado Springs</text>
              <circle cx="200" cy="240" r="8" fill="#50c878" />
              <text x="220" y="245" fill="white" fontSize="12">Pueblo</text>
              <circle cx="200" cy="320" r="8" fill="#50c878" />
              <text x="220" y="325" fill="white" fontSize="12">Trinidad</text>
              {/* Animated truck */}
              <g transform={`translate(200, ${50 + truckPosition * 2.7})`}>
                <rect x="-12" y="-6" width="24" height="12" fill="#d4af37" rx="2" />
                <circle cx="-6" cy="8" r="3" fill="#333" />
                <circle cx="6" cy="8" r="3" fill="#333" />
              </g>
            </svg>
          </div>
          <div className="mt-4 flex justify-center">
            <GoldButton
              onClick={() => setIsRunning(!isRunning)}
              disabled={isRunning && truckPosition > 0}
            >
              {isRunning ? 'Running...' : 'Start Route'}
            </GoldButton>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <Clock className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">24/7 Operation</h3>
            <p className="text-sm text-muted-foreground">
              Autonomous trucks operate continuously without driver hour restrictions, maximizing corridor throughput.
            </p>
            <div className="text-2xl font-bold text-primary mt-4">3x</div>
            <div className="text-xs text-muted-foreground">More delivery cycles/day</div>
          </Card>

          <Card className="p-6">
            <Truck className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold mb-2">Cost Reduction</h3>
            <p className="text-sm text-muted-foreground">
              Eliminates driver wages (largest operating expense) and reduces fuel consumption via platooning.
            </p>
            <div className="text-2xl font-bold text-accent mt-4">45%</div>
            <div className="text-xs text-muted-foreground">Lower per-mile costs</div>
          </Card>

          <Card className="p-6">
            <MapPin className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Dedicated Corridor</h3>
            <p className="text-sm text-muted-foreground">
              310-mile I-25 segment with dedicated autonomous lanes, 5G coverage, and smart infrastructure.
            </p>
            <div className="text-2xl font-bold text-primary mt-4">310mi</div>
            <div className="text-xs text-muted-foreground">Autonomous corridor length</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
