import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UserActivityChartProps {
  data: Array<{
    date: string;
    visits: number;
    interactions: number;
    signups: number;
  }>;
}

export function UserActivityChart({ data }: UserActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => value.toLocaleString()}
          labelFormatter={(label) => new Date(label).toLocaleDateString()}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="visits"
          stroke="#d4af37"
          strokeWidth={2}
          name="Visits"
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="interactions"
          stroke="#50c878"
          strokeWidth={2}
          name="Interactions"
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="signups"
          stroke="#4169e1"
          strokeWidth={2}
          name="Signups"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
