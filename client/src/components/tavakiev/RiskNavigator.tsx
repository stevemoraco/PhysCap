import { useMemo, useState } from "react";
import type { TavakievRiskEntry } from "@/lib/tavakievTypes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type SeverityFilter = "all" | "high" | "medium" | "low";

interface RiskNavigatorProps {
  risks?: TavakievRiskEntry[];
  onSelectRisk?: (risk: TavakievRiskEntry) => void;
}

const severityWeight: Record<TavakievRiskEntry["severity"], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function RiskNavigator({ risks, onSelectRisk }: RiskNavigatorProps) {
  const [filter, setFilter] = useState<SeverityFilter>("high");

  const filtered = useMemo(() => {
    if (!risks || risks.length === 0) return [];
    const ordered = [...risks].sort(
      (a, b) => severityWeight[b.severity] - severityWeight[a.severity],
    );
    if (filter === "all") {
      return ordered;
    }
    return ordered.filter((risk) => risk.severity === filter);
  }, [filter, risks]);

  if (!risks || risks.length === 0) {
    return (
      <div className="rounded-xl border border-primary/15 bg-card/60 p-6 backdrop-blur">
        <h3 className="font-serif text-2xl text-primary">Risk Navigator</h3>
        <p className="mt-4 text-sm text-muted-foreground">
          Risk telemetry is syncing from the Tavakiev command layer. Advisors will soon
          be able to inspect supply, policy, and automation mitigation tracks here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/15 bg-card/60 p-6 backdrop-blur">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-serif text-2xl text-primary">Risk Navigator</h3>
          <p className="text-sm text-muted-foreground">
            Filter the live mitigation register; each card ties back to AI-updated playbooks
            inside the digital twin.
          </p>
        </div>
        <div className="flex gap-2">
          {(["high", "medium", "low", "all"] as SeverityFilter[]).map((level) => (
            <button
              key={level}
              type="button"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                filter === level
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/60 text-muted-foreground hover:bg-primary/10",
              )}
              onClick={() => setFilter(level)}
            >
              {level === "all" ? "All" : `${level.charAt(0).toUpperCase()}${level.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((risk) => (
          <div
            key={risk.id}
            className="relative flex h-full flex-col rounded-lg border border-primary/10 bg-background/40 p-4 transition-shadow hover:shadow-lg hover:shadow-primary/20"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground">{risk.title}</h4>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  risk.severity === "high" && "bg-red-500/20 text-red-300",
                  risk.severity === "medium" && "bg-amber-500/20 text-amber-200",
                  risk.severity === "low" && "bg-emerald-500/20 text-emerald-200",
                )}
              >
                {risk.severity}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {risk.description}
            </p>

            <div className="mt-3 rounded-lg bg-primary/5 p-3 text-xs text-primary/90">
              <span className="font-semibold text-primary">Mitigation:</span>{" "}
              {risk.mitigation}
            </div>

            {risk.tags && risk.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {risk.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <button
              type="button"
              className="mt-4 text-start text-xs font-semibold text-primary underline-offset-2 hover:underline"
              onClick={() => onSelectRisk?.(risk)}
            >
              Flag for follow-up →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

