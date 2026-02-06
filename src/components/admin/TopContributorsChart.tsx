import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface Contributor {
  name: string;
  points: number;
}

const COLORS = ["hsl(45 90% 55%)", "hsl(0 0% 75%)", "hsl(30 60% 45%)", "hsl(160 40% 40%)", "hsl(160 30% 35%)"];

const TopContributorsChart = () => {
  const [data, setData] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: students, error } = await supabase
        .from("student_points")
        .select("full_name, points_balance")
        .order("points_balance", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching top contributors:", error);
        setLoading(false);
        return;
      }

      setData(
        (students || []).map((s) => ({
          name: s.full_name.length > 12 ? s.full_name.substring(0, 12) + "…" : s.full_name,
          points: s.points_balance ?? 0,
        }))
      );
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-muted-foreground text-xs text-center p-4">Loading...</div>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
        <XAxis type="number" tick={{ fill: "hsl(45 90% 85%)", fontSize: 10 }} allowDecimals={false} />
        <YAxis dataKey="name" type="category" tick={{ fill: "hsl(45 90% 85%)", fontSize: 9 }} width={90} />
        <Tooltip
          contentStyle={{ background: "hsl(160 55% 15%)", border: "1px solid hsl(160 40% 25%)", color: "hsl(45 90% 85%)" }}
        />
        <Bar dataKey="points" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i] || COLORS[4]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopContributorsChart;
