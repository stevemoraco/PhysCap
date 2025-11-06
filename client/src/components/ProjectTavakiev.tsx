import { useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { FeedbackModal } from "./FeedbackModal";
import { Factory, Zap, DollarSign } from "lucide-react";

export function ProjectTavakiev() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* 3D Visualization placeholder - will be enhanced with Three.js */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-card to-primary/10 border border-primary/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
              <Factory className="w-16 h-16 text-primary mx-auto animate-pulse" />
              <p className="text-muted-foreground text-sm">
                Interactive 3D solar manufacturing visualization
                <br />
                <span className="text-xs opacity-70">(Robotic assembly animation)</span>
              </p>
            </div>
          </div>
          {/* Golden border glow */}
          <div className="absolute inset-0 border-2 border-primary/20 rounded-xl pointer-events-none" />
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
