import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const GOAL = 10000;

const SemesterGoalChart = () => {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { count, error } = await supabase
        .from("scan_logs")
        .select("id", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching semester goal:", error);
        setLoading(false);
        return;
      }
      setTotal(count ?? 0);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-muted-foreground text-xs text-center p-4">Loading...</div>;

  const pct = Math.min((total / GOAL) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Circular gauge */}
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(160 40% 25%)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="hsl(45 90% 55%)"
            strokeWidth="10"
            strokeDasharray={`${pct * 3.14} ${314 - pct * 3.14}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-primary text-sm font-bold kiosk-glow">{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-foreground text-xs">{total.toLocaleString()} / {GOAL.toLocaleString()}</p>
        <p className="text-muted-foreground text-[9px]">TOTAL SCANS vs SEMESTER GOAL</p>
      </div>
    </div>
  );
};

export default SemesterGoalChart;
