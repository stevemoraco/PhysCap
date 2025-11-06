import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoldButton } from '@/components/GoldButton';
import { CheckCircle2, Circle } from 'lucide-react';

interface TimelineMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  category: string;
  details?: string[];
  cta?: {
    label: string;
    action: () => void;
  };
}

interface NarrativeTimelineProps {
  milestones: TimelineMilestone[];
  onInteraction?: (type: string, context: any) => void;
}

export function NarrativeTimeline({ milestones, onInteraction }: NarrativeTimelineProps) {
  const [visibleMilestones, setVisibleMilestones] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const milestoneRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const milestoneId = entry.target.getAttribute('data-milestone-id');
          if (milestoneId) {
            setVisibleMilestones((prev) => {
              const newSet = new Set(prev);
              if (entry.isIntersecting) {
                newSet.add(milestoneId);
              }
              return newSet;
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    milestoneRefs.current.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [milestones]);

  const handleMilestoneClick = (milestone: TimelineMilestone) => {
    onInteraction?.('timeline_milestone_click', {
      milestoneId: milestone.id,
      title: milestone.title,
      status: milestone.status,
    });
  };

  return (
    <div className="relative py-8">
      {/* Vertical timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/20"></div>

      <div className="space-y-8">
        {milestones.map((milestone, index) => {
          const isVisible = visibleMilestones.has(milestone.id);
          const isCompleted = milestone.status === 'completed';
          const isInProgress = milestone.status === 'in-progress';

          return (
            <div
              key={milestone.id}
              ref={(el) => {
                if (el) {
                  milestoneRefs.current.set(milestone.id, el);
                }
              }}
              data-milestone-id={milestone.id}
              className={`relative pl-20 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => handleMilestoneClick(milestone)}
            >
              {/* Timeline node */}
              <div className="absolute left-6 top-4">
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                ) : isInProgress ? (
                  <Circle className="w-6 h-6 text-primary animate-pulse" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground" />
                )}
              </div>

              <Card
                className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary/40 ${
                  isInProgress ? 'border-primary/60 shadow-primary/20 shadow-md' : ''
                }`}
                data-testid={`timeline-milestone-${milestone.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={isCompleted ? 'default' : isInProgress ? 'secondary' : 'outline'}>
                        {milestone.category}
                      </Badge>
                      {isInProgress && (
                        <Badge variant="default" className="bg-primary">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.date}</p>
                  </div>
                  {milestone.cta && (
                    <GoldButton
                      size="sm"
                      onClick={(e) => {
                        e?.stopPropagation();
                        milestone.cta?.action();
                      }}
                      data-testid={`timeline-cta-${milestone.id}`}
                    >
                      {milestone.cta.label}
                    </GoldButton>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-2 text-foreground">{milestone.title}</h3>
                <p className="text-muted-foreground mb-4">{milestone.description}</p>

                {milestone.details && milestone.details.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-border">
                    {milestone.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">{detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
