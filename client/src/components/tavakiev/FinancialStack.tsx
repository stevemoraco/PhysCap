import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TavakievFinancialEntry } from "@/lib/tavakievTypes";

interface FinancialStackProps {
  entries?: TavakievFinancialEntry[];
}

const categoryColors: Record<TavakievFinancialEntry["category"], string> = {
  credit: "#d4af37",
  investment: "#f97068",
  savings: "#50c878",
  operational: "#4a90e2",
};

export function FinancialStack({ entries }: FinancialStackProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-xl border border-primary/15 bg-card/60 p-6 backdrop-blur">
        <h3 className="font-serif text-2xl text-primary">
          Incentive Waterfall
        </h3>
        <p className="mt-4 text-sm text-muted-foreground">
          Financial stack analytics will appear here once the credit ingest
          pipeline syncs the latest IRA transfers and autonomous manufacturing
          opex deltas.
        </p>
      </div>
    );
  }

  const chartData = entries.map((entry) => ({
    name: entry.label,
    value: entry.value,
    category: entry.category,
    description: entry.description,
  }));

  return (
    <div className="rounded-xl border border-primary/15 bg-card/60 p-6 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-serif text-2xl text-primary">
            Incentive Waterfall
          </h3>
          <p className="text-sm text-muted-foreground">
            Stacked IRA credits and autonomous savings offset capital outlay,
            yielding a net-positive cash position before first module shipment.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 12, right: 24, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.15)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
              tickFormatter={(value) => `$${value}M`}
            />
            <Tooltip
              formatter={(value: number, _name, payload) => [
                `$${value}M`,
                (payload?.payload?.category as string) ?? "",
              ]}
              labelClassName="font-semibold"
              contentStyle={{
                backgroundColor: "rgba(10, 46, 44, 0.9)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(212, 175, 55, 0.35)",
                color: "#fff",
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={`cell-${entry.name}-${idx}`}
                  fill={categoryColors[entry.category]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {entries.map((entry) => (
          <div
            key={entry.label}
            className="rounded-lg border border-primary/10 bg-background/40 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground">
                {entry.label}
              </h4>
              <span
                className="rounded-full bg-primary/10 px-2 py-1 text-xs capitalize text-primary"
                style={{
                  backgroundColor: `${categoryColors[entry.category]}22`,
                  color: categoryColors[entry.category],
                }}
              >
                {entry.category}
              </span>
            </div>
            <div className="mt-2 text-lg font-semibold text-primary">
              {entry.value >= 0 ? "+" : "-"}${Math.abs(entry.value)}M
            </div>
            {entry.description && (
              <p className="mt-2 text-xs text-muted-foreground">
                {entry.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
