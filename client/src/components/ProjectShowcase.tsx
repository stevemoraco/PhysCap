import { useState } from "react";
import { Card } from "@/components/ui/card";
import { GoldButton } from "./GoldButton";
import { FeedbackModal } from "./FeedbackModal";
import { TabeguacheResort3D } from "./TabeguacheResort3D";
import { VenustasTower3D } from "./VenustasTower3D";
import { YadilhilOrbital3D } from "./YadilhilOrbital3D";
import { Building2, Rocket, Hotel } from "lucide-react";
import { usePersonalization } from "@/hooks/usePersonalization";
import { useAuth } from "@/hooks/useAuth";
import { useInteractionTracking } from "@/hooks/useInteractionTracking";

interface Project {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: string;
  visualType: 'resort' | 'tower' | 'orbital';
  ctaLabel: string;
  personalizationHint: string;
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
    ctaLabel: "Design the Tabeguache Collection",
    personalizationHint: "We’re curating alpine experiences with prefab speed—bring your hospitality playbook.",
  },
  {
    id: "venustas",
    name: "Venustas Tower",
    title: "Venustas Tower",
    description: "Construction of the world's tallest skyscraper featuring the highest viewing platform, an outdoor staircase ascending the exterior, and heated year-round hanging gardens on apartment balconies. A vertical city reimagined.",
    icon: <Building2 className="w-6 h-6" />,
    status: "Design Phase",
    visualType: 'tower',
    ctaLabel: "Join the Venustas design council",
    personalizationHint: "Your structural insight unlocks heated sky gardens and outdoor ascent experiences.",
  },
  {
    id: "yadilhil",
    name: "Yádiłhił",
    title: "Yádiłhił Orbital Complex",
    description: "The first orbital apartment complex, manufactured in Colorado and launched from a Starship pad at the Colorado Space Facility near Denver. Humanity's next frontier in luxury living.",
    icon: <Rocket className="w-6 h-6" />,
    status: "Concept Development",
    visualType: 'orbital',
    ctaLabel: "Advise the orbital launch collective",
    personalizationHint: "Orbital habitats demand cross-disciplinary leadership—lend your voice to the founding cohort.",
  },
];

export function ProjectShowcase() {
  const [activeFeedback, setActiveFeedback] = useState<{ id: string; name: string } | null>(null);
  const { getPersonalizedText } = usePersonalization();
  const { user } = useAuth();
  const { trackCTA } = useInteractionTracking(user?.id);

  const handleExpressInterest = (project: Project) => {
    trackCTA({
      label: project.ctaLabel,
      section: 'project_showcase',
      projectId: project.id,
    });
    setActiveFeedback({ id: project.id, name: project.name });
  };

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
              {project.visualType === 'resort' && (
                <TabeguacheResort3D
                  className="w-full h-full"
                  ctaLabel={project.ctaLabel}
                  personalizationHint={getPersonalizedText(
                    `projects.${project.id}.hint`,
                    project.personalizationHint,
                  )}
                  onExpressInterest={() => handleExpressInterest(project)}
                />
              )}
              {project.visualType === 'tower' && (
                <VenustasTower3D
                  className="w-full h-full"
                  ctaLabel={project.ctaLabel}
                  personalizationHint={getPersonalizedText(
                    `projects.${project.id}.hint`,
                    project.personalizationHint,
                  )}
                  onExpressInterest={() => handleExpressInterest(project)}
                />
              )}
              {project.visualType === 'orbital' && (
                <YadilhilOrbital3D
                  className="w-full h-full"
                  ctaLabel={project.ctaLabel}
                  personalizationHint={getPersonalizedText(
                    `projects.${project.id}.hint`,
                    project.personalizationHint,
                  )}
                  onExpressInterest={() => handleExpressInterest(project)}
                />
              )}
              {/* Info overlay */}
              <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-primary border border-primary/20">
                Interactive 3D
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
                onClick={() => handleExpressInterest(project)}
                className="w-full"
                icon="sparkle"
              >
                {getPersonalizedText(`projects.${project.id}.cta`, "Express Interest")}
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
