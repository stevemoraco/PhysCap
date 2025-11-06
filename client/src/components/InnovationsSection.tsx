import { InnovationCard } from "./InnovationCard";
import { Truck, Building, Bot, Sparkles } from "lucide-react";

const innovations = [
  {
    title: "Golden Spike",
    description: "Supply chain verticalization and centralization, sourcing raw materials from Colorado. Autonomous Tesla truck shipping to datacenters and solar sites across Eastern Colorado, enabling a 10x increase in US power production over 3-5 years.",
    icon: <Truck className="w-6 h-6" />,
  },
  {
    title: "Project Vitruvius",
    description: "Revolutionary prefab construction technology for rapid deployment of resort properties and the Venustas Tower. Modular systems manufactured in controlled environments, then assembled on-site with robotic precision.",
    icon: <Building className="w-6 h-6" />,
  },
  {
    title: "Project Talos",
    description: "Advanced manufacturing and construction using autonomous humanoid robots (Optimus, Figure, etc.). 24/7 lights-out operations eliminate 95% of labor costs while achieving unprecedented quality and consistency.",
    icon: <Bot className="w-6 h-6" />,
  },
  {
    title: "Story Engineering",
    description: "Powered by DATA, our in-house AI platform that autonomously engages stakeholders, designs marketing assets, and communicates project benefits to every affected community member. Every project tells a compelling story.",
    icon: <Sparkles className="w-6 h-6" />,
  },
];

export function InnovationsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-card/30" id="innovations">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Core <span className="text-primary">Innovations</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proprietary technologies powering all Physical.Capital projects
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {innovations.map((innovation, idx) => (
            <InnovationCard
              key={idx}
              title={innovation.title}
              description={innovation.description}
              icon={innovation.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
