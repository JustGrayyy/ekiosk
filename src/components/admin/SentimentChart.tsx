import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { SentimentLog } from "@/hooks/useAdminAnalytics";

const FEELING_COLORS: Record<string, string> = {
  Happy: "hsl(45 90% 55%)",
  Proud: "hsl(160 40% 40%)",
  Neutral: "hsl(0 0% 60%)",
};

const FEELING_KEYS = ["Happy", "Proud", "Neutral"];

interface SentimentChartProps {
  data: SentimentLog[];
}

const SentimentChart = ({ data }: SentimentChartProps) => {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    FEELING_KEYS.forEach((key) => (counts[key] = 0));

    data.forEach((log) => {
      const feeling = log.feeling;
      if (feeling in counts) {
        counts[feeling]++;
      }
    });

    return FEELING_KEYS.map((name) => ({ name, value: counts[name] }));
  }, [data]);

  const hasData = chartData.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[220px] text-muted-foreground text-[10px]">
        No sentiment data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          stroke="none"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={FEELING_COLORS[entry.name] ?? "hsl(0 0% 40%)"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(160 55% 15%)",
            border: "1px solid hsl(160 40% 25%)",
            color: "hsl(45 90% 85%)",
            borderRadius: "8px",
            fontSize: "11px",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "10px", color: "hsl(45 90% 85%)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SentimentChart;
