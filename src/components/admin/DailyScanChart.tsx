import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface DayData {
  day: string;
  count: number;
}

const DailyScanChart = () => {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: logs, error } = await supabase
        .from("scan_logs")
        .select("scanned_at")
        .gte("scanned_at", sevenDaysAgo.toISOString());

      if (error) {
        console.error("Error fetching scan logs:", error);
        setLoading(false);
        return;
      }

      // Group by day
      const grouped: Record<string, number> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().split("T")[0];
        grouped[key] = 0;
      }

      logs?.forEach((log) => {
        const key = new Date(log.scanned_at).toISOString().split("T")[0];
        if (grouped[key] !== undefined) grouped[key]++;
      });

      setData(
        Object.entries(grouped).map(([day, count]) => ({
          day: new Date(day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
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
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(160 40% 25%)" />
        <XAxis dataKey="day" tick={{ fill: "hsl(45 90% 85%)", fontSize: 10 }} />
        <YAxis tick={{ fill: "hsl(45 90% 85%)", fontSize: 10 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "hsl(160 55% 15%)", border: "1px solid hsl(160 40% 25%)", color: "hsl(45 90% 85%)" }}
        />
        <Line type="monotone" dataKey="count" stroke="hsl(45 90% 55%)" strokeWidth={2} dot={{ fill: "hsl(40 95% 60%)" }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DailyScanChart;
