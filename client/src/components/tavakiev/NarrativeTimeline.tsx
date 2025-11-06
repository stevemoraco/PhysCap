import { useMemo } from "react";
import { GoldButton } from "@/components/GoldButton";
import type { TavakievTimelineEntry } from "@/lib/tavakievTypes";
import { cn } from "@/lib/utils";

interface NarrativeTimelineProps {
  entries?: TavakievTimelineEntry[];
  title?: string;
  onCtaClick?: (entry: TavakievTimelineEntry) => void;
}

export function NarrativeTimeline({
  entries,
  title = "Execution Timeline",
  onCtaClick,
}: NarrativeTimelineProps) {
  const orderedEntries = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    return [...entries].sort(
      (a, b) => a.year - b.year || a.quarter.localeCompare(b.quarter),
    );
  }, [entries]);

  if (orderedEntries.length === 0) {
    return (
      <div className="rounded-xl border border-primary/15 bg-card/60 p-6 backdrop-blur">
        <h3 className="font-serif text-2xl text-primary">{title}</h3>
        <p className="mt-4 text-sm text-muted-foreground">
          Timeline data is preparing—once the Tavakiev execution milestones are synced from the
          digital twin, you&rsquo;ll be able to follow each activation wave in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/15 bg-card/60 p-6 backdrop-blur">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl text-primary">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Track the synchronized Alpha, Beta, and Digital Twin milestones—each waypoint unlocks
            partner-specific CTAs and capital coordination windows.
          </p>
        </div>
      </div>

      <div className="relative pl-6">
        <span className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
        <ol className="space-y-8">
          {orderedEntries.map((entry, index) => (
            <li
              key={entry.id}
              className={cn(
                "relative rounded-lg border border-primary/10 bg-background/50 p-4 hover:border-primary/30 transition-colors",
              )}
            >
              <span className="absolute -left-[31px] top-6 flex h-5 w-5 items-center justify-center rounded-full border border-primary bg-background">
                <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-inner" />
              </span>

              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-primary/80">
                    {entry.quarter} {entry.year}
                  </div>
                  <h4 className="font-serif text-xl text-foreground">
                    {entry.title}
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {entry.description}
                  </p>
                </div>
                {entry.cta && (
                  <GoldButton
                    size="default"
                    variant="outline"
                    onClick={() => onCtaClick?.(entry)}
                    className="mt-2 md:mt-0"
                    data-testid={`timeline-cta-${entry.id}`}
                  >
                    {entry.cta}
                  </GoldButton>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

