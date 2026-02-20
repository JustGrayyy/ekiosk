import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { TriviaLog } from "@/hooks/useAdminAnalytics";

const COLORS = {
  Correct: "hsl(140 60% 45%)",
  Incorrect: "hsl(0 70% 55%)",
};

interface TriviaChartProps {
  data: TriviaLog[];
}

const TriviaChart = ({ data }: TriviaChartProps) => {
  const chartData = useMemo(() => {
    let correct = 0;
    let incorrect = 0;

    data.forEach((log) => {
      if (log.is_correct) {
        correct++;
      } else {
        incorrect++;
      }
    });

    return [
      { name: "Correct", value: correct },
      { name: "Incorrect", value: incorrect },
    ];
  }, [data]);

  const hasData = chartData.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[220px] text-muted-foreground text-[10px]">
        No trivia data yet
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
            <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
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

export default TriviaChart;
