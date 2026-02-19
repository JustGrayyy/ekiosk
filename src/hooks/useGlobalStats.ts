import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGlobalStats = () => {
  return useQuery({
    queryKey: ["global-stats"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("scan_logs")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      
      const totalItems = count || 0;
      const goal = 5000;
      // Formula: (totalBottles * 0.015) * 0.538
      const co2Offset = (totalItems * 0.015) * 0.538;
      const progress = Math.min((totalItems / goal) * 100, 100);

      return {
        totalItems,
        goal,
        co2Offset,
        progress,
      };
    },
    staleTime: 10000,
    refetchInterval: 30000,
  });
};
