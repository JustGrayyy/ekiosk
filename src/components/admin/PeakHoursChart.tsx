import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface HourData {
  hour: string;
  count: number;
}

const PeakHoursChart = () => {
  const [data, setData] = useState<HourData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: logs, error } = await supabase
        .from("scan_logs")
        .select("scanned_at");

      if (error) {
        console.error("Error fetching peak hours:", error);
        setLoading(false);
        return;
      }

      const hourCounts: Record<number, number> = {};
      for (let i = 0; i < 24; i++) hourCounts[i] = 0;

      logs?.forEach((log) => {
        const hour = new Date(log.scanned_at).getHours();
        hourCounts[hour]++;
      });

      setData(
        Object.entries(hourCounts).map(([h, count]) => ({
          hour: `${parseInt(h) % 12 || 12}${parseInt(h) < 12 ? "a" : "p"}`,
          count,
        }))
      );
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-muted-foreground text-xs text-center p-4">Loading...</div>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <XAxis dataKey="hour" tick={{ fill: "hsl(45 90% 85%)", fontSize: 8 }} interval={1} />
        <YAxis tick={{ fill: "hsl(45 90% 85%)", fontSize: 10 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "hsl(160 55% 15%)", border: "1px solid hsl(160 40% 25%)", color: "hsl(45 90% 85%)" }}
        />
        <Bar dataKey="count" fill="hsl(40 95% 60%)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PeakHoursChart;
