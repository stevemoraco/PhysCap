import { Navigation } from "@/components/Navigation";
import { GoldButton } from "@/components/GoldButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bot, Zap, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function InnovationTalos() {
  const [workCellActive, setWorkCellActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const startWorkCell = () => {
    setWorkCellActive(true);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setCycleCount(count);
      if (count >= 10) {
        clearInterval(interval);
        setWorkCellActive(false);
        setCycleCount(0);
      }
    }, 500);
  };

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
          <h1 className="text-4xl font-bold mb-2">Talos Humanoid Robotics</h1>
          <p className="text-xl text-muted-foreground">Autonomous Labor for Manufacturing</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary">95% Labor Cost Reduction</Badge>
            <Badge variant="secondary">24/7 Operation</Badge>
            <Badge variant="secondary">Optimus + Figure</Badge>
          </div>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Automated Work Cell Demo</h2>
            <div className="flex items-center gap-4">
              {workCellActive && (
                <Badge variant="default" className="animate-pulse">
                  Cycle {cycleCount}/10
                </Badge>
              )}
              <GoldButton
                onClick={startWorkCell}
                disabled={workCellActive}
                size="sm"
              >
                {workCellActive ? 'Running...' : 'Start Work Cell'}
              </GoldButton>
            </div>
          </div>
          <div className="relative h-96 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
            {/* Simple robot visualization */}
            <div className="grid grid-cols-2 gap-12">
              {/* Optimus Robot */}
              <div className="flex flex-col items-center">
                <div className={`transition-all duration-300 ${workCellActive ? 'animate-bounce' : ''}`}>
                  <div className="w-16 h-24 bg-gradient-to-b from-gray-400 to-gray-600 rounded-lg relative">
                    <div className="w-12 h-12 bg-gray-500 rounded-full absolute -top-6 left-2"></div>
                    <div className="w-4 h-16 bg-gray-500 rounded absolute -left-5 top-2"></div>
                    <div className="w-4 h-16 bg-gray-500 rounded absolute -right-5 top-2"></div>
                    <div className="w-4 h-20 bg-gray-600 rounded absolute left-2 top-24"></div>
                    <div className="w-4 h-20 bg-gray-600 rounded absolute right-2 top-24"></div>
                  </div>
                </div>
                <div className="text-white text-sm mt-4">Tesla Optimus</div>
                <div className="text-xs text-gray-400">Assembly Tasks</div>
              </div>

              {/* Figure Robot */}
              <div className="flex flex-col items-center">
                <div className={`transition-all duration-300 ${workCellActive ? 'animate-bounce' : ''}`} style={{ animationDelay: '150ms' }}>
                  <div className="w-16 h-24 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg relative">
                    <div className="w-12 h-12 bg-blue-500 rounded-full absolute -top-6 left-2"></div>
                    <div className="w-4 h-16 bg-blue-500 rounded absolute -left-5 top-2"></div>
                    <div className="w-4 h-16 bg-blue-500 rounded absolute -right-5 top-2"></div>
                    <div className="w-4 h-20 bg-blue-600 rounded absolute left-2 top-24"></div>
                    <div className="w-4 h-20 bg-blue-600 rounded absolute right-2 top-24"></div>
                  </div>
                </div>
                <div className="text-white text-sm mt-4">Figure 02</div>
                <div className="text-xs text-gray-400">Quality Inspection</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <TrendingDown className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Labor Cost Reduction</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Eliminate 95% of manual labor costs. Robots cost $0.50/hour vs. $25-35/hour for human workers.
            </p>
            <div className="text-3xl font-bold text-primary">95%</div>
            <div className="text-xs text-muted-foreground">Cost savings</div>
          </Card>

          <Card className="p-6">
            <Zap className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold mb-2">24/7 Operation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Continuous production without breaks, shifts, or overtime. 3x more productive than human shifts.
            </p>
            <div className="text-3xl font-bold text-accent">24/7</div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </Card>

          <Card className="p-6">
            <Bot className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Precision & Safety</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Computer vision enables micron-level precision. Zero workplace injuries. Consistent quality.
            </p>
            <div className="text-3xl font-bold text-primary">99.8%</div>
            <div className="text-xs text-muted-foreground">Quality rate</div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Robot Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-primary">Tesla Optimus Gen 2</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Height: 5'8" (173cm), Weight: 161 lbs</li>
                <li>• 28 actuated degrees of freedom</li>
                <li>• Payload capacity: 45 lbs (20kg)</li>
                <li>• Walking speed: 5 mph (8 km/h)</li>
                <li>• Battery: 2.3 kWh, 8-hour runtime</li>
                <li>• Tasks: Assembly, material handling, inspection</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-accent">Figure 02</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Height: 5'6" (168cm), Weight: 154 lbs</li>
                <li>• Full human-like dexterity</li>
                <li>• Advanced computer vision (6 cameras)</li>
                <li>• Natural language interface</li>
                <li>• Multi-modal learning (vision + language)</li>
                <li>• Tasks: Complex assembly, machine tending</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
