import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGlobalStats = () => {
  return useQuery({
    queryKey: ["global-stats"],
    queryFn: async () => {
      // Fetch total items scanned by counting rows in scan_logs
      // We use count: 'exact' to get the total number of rows efficiently
      const { count, error } = await supabase
        .from("scan_logs")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      
      const totalItems = count || 0;
      const goal = 5000;
      const co2Offset = totalItems * 0.08;
      const progress = Math.min((totalItems / goal) * 100, 100);

      return {
        totalItems,
        goal,
        co2Offset,
        progress,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
