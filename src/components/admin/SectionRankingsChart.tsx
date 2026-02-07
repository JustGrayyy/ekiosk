import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SectionRank {
  section: string;
  total_points: number;
}

const SectionRankingsChart = () => {
  const [sections, setSections] = useState<SectionRank[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("student_points")
        .select("section, points_balance");

      if (data) {
        const map: Record<string, number> = {};
        for (const row of data) {
          const key = (row as any).section || "Unassigned";
          map[key] = (map[key] || 0) + (row.points_balance || 0);
        }
        const sorted = Object.entries(map)
          .map(([section, total_points]) => ({ section, total_points }))
          .sort((a, b) => b.total_points - a.total_points);
        setSections(sorted);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-1.5">
      {sections.length === 0 ? (
        <p className="text-muted-foreground text-[9px] text-center py-4">No data yet</p>
      ) : (
        sections.map((s, i) => (
          <div
            key={s.section}
            className={`flex justify-between items-center text-[9px] sm:text-[10px] md:text-xs py-1 px-2 rounded ${
              i === 0 ? "bg-yellow-500/10 border border-yellow-500/30" : ""
            }`}
          >
            <span className={`truncate mr-2 ${i === 0 ? "text-yellow-400 font-semibold" : "text-foreground/70"}`}>
              <span className="text-primary mr-1.5">#{i + 1}</span>
              {s.section}
            </span>
            <span className={`font-mono ${i === 0 ? "text-yellow-400" : "text-primary"}`}>
              {s.total_points}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default SectionRankingsChart;
