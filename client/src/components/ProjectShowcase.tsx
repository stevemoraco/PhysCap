import { useState } from "react";
import { Card } from "@/components/ui/card";
import { GoldButton } from "./GoldButton";
import { FeedbackModal } from "./FeedbackModal";
import { Building2, Rocket, Hotel } from "lucide-react";

interface Project {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: string;
}

const projects: Project[] = [
  {
    id: "tabeguache",
    name: "The Tabeguache Collection",
    title: "The Tabeguache Collection",
    description: "Acquisition & development of a premier Colorado resort & experiences company including Gateway Canyons, Antlers, and Union Printers Home. Luxury hospitality meets cutting-edge prefab construction innovation.",
    icon: <Hotel className="w-6 h-6" />,
    status: "Planning Phase",
  },
  {
    id: "venustas",
    name: "Venustas Tower",
    title: "Venustas Tower",
    description: "Construction of the world's tallest skyscraper featuring the highest viewing platform, an outdoor staircase ascending the exterior, and heated year-round hanging gardens on apartment balconies. A vertical city reimagined.",
    icon: <Building2 className="w-6 h-6" />,
    status: "Design Phase",
  },
  {
    id: "yadilhil",
    name: "Yádiłhił",
    title: "Yádiłhił Orbital Complex",
    description: "The first orbital apartment complex, manufactured in Colorado and launched from a Starship pad at the Colorado Space Facility near Denver. Humanity's next frontier in luxury living.",
    icon: <Rocket className="w-6 h-6" />,
    status: "Concept Development",
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
            className="p-6 bg-card/60 backdrop-blur-sm border-primary/10 hover-elevate transition-all duration-300 group"
            data-testid={`card-project-${project.id}`}
          >
            <div className="space-y-4">
              {/* Icon */}
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                {project.icon}
              </div>

              {/* Status badge */}
              <div className="inline-block px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-medium">
                {project.status}
              </div>

              {/* Title */}
              <h3 className="font-serif text-xl font-bold text-foreground">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed min-h-[120px]">
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
