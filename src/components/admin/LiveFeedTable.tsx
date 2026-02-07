import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ScanRow {
  id: string;
  lrn: string;
  section: string | null;
  points_added: number | null;
  scanned_at: string | null;
}

const LiveFeedTable = () => {
  const [scans, setScans] = useState<ScanRow[]>([]);

  const fetchScans = async () => {
    const { data } = await supabase
      .from("scan_logs")
      .select("*")
      .order("scanned_at", { ascending: false })
      .limit(10);
    if (data) setScans(data as unknown as ScanRow[]);
  };

  useEffect(() => {
    fetchScans();

    const channel = supabase
      .channel("live-scans")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scan_logs" },
        () => fetchScans()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-1.5">
      {scans.length === 0 ? (
        <p className="text-muted-foreground text-[9px] text-center py-4">No scans yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[8px] sm:text-[9px] md:text-[10px]">
            <thead>
              <tr className="text-muted-foreground border-b border-border/30">
                <th className="text-left py-1 pr-2">TIME</th>
                <th className="text-left py-1 pr-2">LRN</th>
                <th className="text-left py-1 pr-2">SECTION</th>
                <th className="text-right py-1">PTS</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => (
                <tr key={s.id} className="text-foreground/70 border-b border-border/10">
                  <td className="py-1 pr-2 text-muted-foreground">
                    {s.scanned_at
                      ? formatDistanceToNow(new Date(s.scanned_at), { addSuffix: true })
                      : "---"}
                  </td>
                  <td className="py-1 pr-2 font-mono">{s.lrn}</td>
                  <td className="py-1 pr-2">{s.section || "---"}</td>
                  <td className="py-1 text-right text-primary">{s.points_added ?? 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LiveFeedTable;
