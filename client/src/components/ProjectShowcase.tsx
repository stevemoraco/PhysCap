import { useState } from "react";
import { Card } from "@/components/ui/card";
import { GoldButton } from "./GoldButton";
import { FeedbackModal } from "./FeedbackModal";
import { Project3DPlaceholder } from "./Project3DPlaceholder";
import { Building2, Rocket, Hotel } from "lucide-react";

interface Project {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: string;
  visualType: 'resort' | 'tower' | 'orbital';
}

const projects: Project[] = [
  {
    id: "tabeguache",
    name: "The Tabeguache Collection",
    title: "The Tabeguache Collection",
    description: "Acquisition & development of a premier Colorado resort & experiences company including Gateway Canyons, Antlers, and Union Printers Home. Luxury hospitality meets cutting-edge prefab construction innovation.",
    icon: <Hotel className="w-6 h-6" />,
    status: "Planning Phase",
    visualType: 'resort',
  },
  {
    id: "venustas",
    name: "Venustas Tower",
    title: "Venustas Tower",
    description: "Construction of the world's tallest skyscraper featuring the highest viewing platform, an outdoor staircase ascending the exterior, and heated year-round hanging gardens on apartment balconies. A vertical city reimagined.",
    icon: <Building2 className="w-6 h-6" />,
    status: "Design Phase",
    visualType: 'tower',
  },
  {
    id: "yadilhil",
    name: "Yádiłhił",
    title: "Yádiłhił Orbital Complex",
    description: "The first orbital apartment complex, manufactured in Colorado and launched from a Starship pad at the Colorado Space Facility near Denver. Humanity's next frontier in luxury living.",
    icon: <Rocket className="w-6 h-6" />,
    status: "Concept Development",
    visualType: 'orbital',
  },
];

export function ProjectShowcase() {
  const [activeFeedback, setActiveFeedback] = useState<{ id: string; name: string } | null>(null);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="p-0 bg-card/60 backdrop-blur-sm border-primary/10 hover-elevate transition-all duration-300 group overflow-hidden"
            data-testid={`card-project-${project.id}`}
          >
            {/* 3D Visualization */}
            <div className="relative h-48 bg-gradient-to-br from-card to-primary/10 border-b border-primary/20">
              <Project3DPlaceholder projectType={project.visualType} className="w-full h-full" />
              {/* Info overlay */}
              <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-primary border border-primary/20">
                3D Preview
              </div>
            </div>

            {/* Card content */}
            <div className="p-6 space-y-4">
              {/* Icon & Status */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  {project.icon}
                </div>
                <div className="px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-medium">
                  {project.status}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-serif text-xl font-bold text-foreground">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed min-h-[100px]">
                {project.description}
              </p>

              {/* CTA */}
              <GoldButton
                onClick={() => setActiveFeedback({ id: project.id, name: project.name })}
                className="w-full"
                icon="sparkle"
              >
                Express Interest
              </GoldButton>
            </div>
          </Card>
        ))}
      </div>

      {activeFeedback && (
        <FeedbackModal
          open={!!activeFeedback}
          onOpenChange={(open) => !open && setActiveFeedback(null)}
          projectId={activeFeedback.id}
          projectName={activeFeedback.name}
        />
      )}
    </>
  );
}
