import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const PointsEconomyChart = () => {
  const [data, setData] = useState<{ label: string; earned: number; redeemed: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [scanRes, redeemRes] = await Promise.all([
        supabase.from("scan_logs").select("id", { count: "exact", head: true }),
        supabase.from("redemption_logs").select("points_redeemed"),
      ]);

      const totalEarned = scanRes.count ?? 0;
      const totalRedeemed = redeemRes.data?.reduce((sum, r) => sum + r.points_redeemed, 0) ?? 0;

      setData([{ label: "Points", earned: totalEarned, redeemed: totalRedeemed }]);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-muted-foreground text-xs text-center p-4">Loading...</div>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <XAxis dataKey="label" tick={{ fill: "hsl(45 90% 85%)", fontSize: 10 }} />
        <YAxis tick={{ fill: "hsl(45 90% 85%)", fontSize: 10 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "hsl(160 55% 15%)", border: "1px solid hsl(160 40% 25%)", color: "hsl(45 90% 85%)" }}
        />
        <Legend wrapperStyle={{ fontSize: 10, color: "hsl(45 90% 85%)" }} />
        <Bar dataKey="earned" name="Earned" fill="hsl(45 90% 55%)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="redeemed" name="Redeemed" fill="hsl(0 70% 55%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PointsEconomyChart;
