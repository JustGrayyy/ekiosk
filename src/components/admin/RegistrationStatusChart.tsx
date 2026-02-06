import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const RegistrationStatusChart = () => {
  const [active, setActive] = useState(0);
  const [inactive, setInactive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: students, error } = await supabase
        .from("student_points")
        .select("points_balance");

      if (error) {
        console.error("Error fetching registration status:", error);
        setLoading(false);
        return;
      }

      const a = students?.filter((s) => (s.points_balance ?? 0) > 0).length ?? 0;
      const total = students?.length ?? 0;
      setActive(a);
      setInactive(total - a);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-muted-foreground text-xs text-center p-4">Loading...</div>;

  const total = active + inactive;
  const chartData = [
    { name: "Active", value: active },
    { name: "Inactive", value: inactive },
  ];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill="hsl(45 90% 55%)" />
            <Cell fill="hsl(160 30% 35%)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-primary text-lg font-bold kiosk-glow">{total}</span>
        <span className="text-muted-foreground text-[8px]">REGISTERED</span>
      </div>
      <div className="flex justify-center gap-4 text-[9px] -mt-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: "hsl(45 90% 55%)" }} />
          <span className="text-foreground/70">Active ({active})</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: "hsl(160 30% 35%)" }} />
          <span className="text-foreground/70">Inactive ({inactive})</span>
        </span>
      </div>
    </div>
  );
};

export default RegistrationStatusChart;
