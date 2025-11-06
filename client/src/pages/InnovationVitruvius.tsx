import { Navigation } from "@/components/Navigation";
import { GoldButton } from "@/components/GoldButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Box, Layers, Clock3 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function InnovationVitruvius() {
  const [assemblyState, setAssemblyState] = useState<'exploded' | 'assembled'>('exploded');

  const toggleAssembly = () => {
    setAssemblyState((prev) => (prev === 'exploded' ? 'assembled' : 'exploded'));
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
          <h1 className="text-4xl font-bold mb-2">Vitruvius Pre-Fab Construction</h1>
          <p className="text-xl text-muted-foreground">Factory-Built Modular Buildings</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary">6-Month Build Time</Badge>
            <Badge variant="secondary">70% Cost Reduction</Badge>
            <Badge variant="secondary">Factory Precision</Badge>
          </div>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Modular Assembly Animation</h2>
            <GoldButton onClick={toggleAssembly} size="sm">
              {assemblyState === 'exploded' ? 'Assemble' : 'Explode View'}
            </GoldButton>
          </div>
          <div className="relative h-96 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
            {/* Simple exploded/assembled view */}
            <div className={`transition-all duration-1000 ${assemblyState === 'exploded' ? 'space-y-12' : 'space-y-0'}`}>
              {/* Roof */}
              <div
                className={`w-64 h-16 bg-gradient-to-b from-red-700 to-red-800 rounded-lg mx-auto shadow-xl transition-all duration-1000 ${
                  assemblyState === 'exploded' ? 'transform -translate-y-12' : ''
                }`}
              >
                <div className="text-white text-center py-1 text-xs">Roof Module</div>
              </div>
              {/* Floor 3 */}
              <div className="w-64 h-20 bg-gradient-to-b from-amber-600 to-amber-700 rounded mx-auto shadow-xl">
                <div className="text-white text-center py-1 text-xs">Floor 3 Module</div>
              </div>
              {/* Floor 2 */}
              <div className="w-64 h-20 bg-gradient-to-b from-amber-600 to-amber-700 rounded mx-auto shadow-xl">
                <div className="text-white text-center py-1 text-xs">Floor 2 Module</div>
              </div>
              {/* Floor 1 */}
              <div className="w-64 h-20 bg-gradient-to-b from-amber-600 to-amber-700 rounded mx-auto shadow-xl">
                <div className="text-white text-center py-1 text-xs">Floor 1 Module</div>
              </div>
              {/* Foundation */}
              <div
                className={`w-72 h-12 bg-gradient-to-b from-gray-600 to-gray-700 rounded-lg mx-auto shadow-xl transition-all duration-1000 ${
                  assemblyState === 'exploded' ? 'transform translate-y-12' : ''
                }`}
              >
                <div className="text-white text-center py-1 text-xs">Foundation Module</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock3 className="w-5 h-5 text-primary" />
              Time Savings
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Traditional Construction</span>
                  <span className="font-semibold">18 months</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gray-500" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Vitruvius Pre-Fab</span>
                  <span className="font-semibold text-primary">6 months</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '33%' }}></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent" />
              Quality Benefits
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Factory-controlled environment (no weather delays)</li>
              <li>• Precision CNC cutting and assembly</li>
              <li>• ISO 9001 quality management</li>
              <li>• Reduced waste: 75% less construction debris</li>
              <li>• Energy efficiency: R-40 insulation standard</li>
            </ul>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Box className="w-5 h-5 text-primary" />
            Module Types
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="text-2xl mb-2">🏢</div>
              <div className="font-semibold text-sm mb-1">Residential</div>
              <div className="text-xs text-muted-foreground">Apartments, condos, single-family</div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="text-2xl mb-2">🏭</div>
              <div className="font-semibold text-sm mb-1">Commercial</div>
              <div className="text-xs text-muted-foreground">Offices, retail, warehouses</div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="text-2xl mb-2">🏥</div>
              <div className="font-semibold text-sm mb-1">Healthcare</div>
              <div className="text-xs text-muted-foreground">Hospitals, clinics, urgent care</div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="text-2xl mb-2">🎓</div>
              <div className="font-semibold text-sm mb-1">Education</div>
              <div className="text-xs text-muted-foreground">Schools, universities, daycare</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
