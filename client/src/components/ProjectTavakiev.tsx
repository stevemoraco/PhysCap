import { useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { FeedbackModal } from "./FeedbackModal";
import { SolarManufacturing3D } from "./SolarManufacturing3D";
import { Factory, Zap, DollarSign } from "lucide-react";

export function ProjectTavakiev() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* 3D Visualization - GPU-accelerated solar manufacturing demo */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-card to-primary/10 border border-primary/20 shadow-xl shadow-primary/20">
          <SolarManufacturing3D className="w-full h-full" />
          {/* Golden border glow */}
          <div className="absolute inset-0 border-2 border-primary/20 rounded-xl pointer-events-none" />
          {/* Info overlay */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground">
              <Factory className="w-3 h-3 inline mr-1" />
              Real-time 3D simulation: Autonomous robotic assembly
            </p>
          </div>
        </div>

        {/* Project details */}
        <ProjectCard
          title="Project Tavakiev"
          description="Self-assembling solar panel manufacturing at the former Intel facility in Colorado Springs. A 2 GW autonomous gigafactory powered by humanoid robots (Tesla Optimus, Figure) producing panels at 100x cost reduction through IRA tax credit stacking and lights-out manufacturing."
          metrics={[
            { label: "Capacity", value: "2 GW", icon: <Zap className="w-5 h-5" /> },
            { label: "Cost Reduction", value: "100x", icon: <DollarSign className="w-5 h-5" /> },
            { label: "Timeline", value: "6-9mo", icon: <Factory className="w-5 h-5" /> },
          ]}
          onExpressInterest={() => setFeedbackOpen(true)}
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">The Innovation:</strong> Parallel execution of Alpha site (physical testbed), 
              Beta campus (greenfield planning), and Digital Twin (virtualized commissioning) to compress multi-year 
              timelines into months.
            </p>
            <p>
              <strong className="text-foreground">Financial Model:</strong> IRA §45X tax credits ($59.68/panel) exceed 
              Chinese competitor prices ($44/panel), enabling profitable sales at any price point.
            </p>
          </div>
        </ProjectCard>
      </div>

      <FeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        projectId="tavakiev"
        projectName="Project Tavakiev"
      />
    </>
  );
}
