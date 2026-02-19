import { motion } from "framer-motion";
import { Leaf, Globe, Target } from "lucide-react";
import { useGlobalStats } from "@/hooks/useGlobalStats";

export const GlobalEnvironmentalImpact = () => {
  const { data: stats, isLoading } = useGlobalStats();

  if (isLoading || !stats) return null;

  return (
    <div className="w-full max-w-4xl space-y-6 px-2 mb-8">
      {/* Goal Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-primary text-[10px] sm:text-xs md:text-sm font-bold kiosk-glow">
              SCHOOL GOAL: {stats.totalItems.toLocaleString()} / {stats.goal.toLocaleString()} BOTTLES RECOVERED!
            </span>
          </div>
          <span className="text-primary font-mono text-[10px] sm:text-xs">
            {Math.round((stats.totalItems / stats.goal) * 100)}%
          </span>
        </div>
        <div className="relative h-6 sm:h-8 w-full bg-secondary/30 rounded-full overflow-hidden border-2 border-primary/20 p-1">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-green-600 to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${stats.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Impact Card */}
      <motion.div
        className="kiosk-panel rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border-l-4 border-green-500"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-green-500/10 p-3 rounded-full">
          <Leaf className="w-8 h-8 text-green-500" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-primary text-xs sm:text-sm font-bold mb-1 flex items-center justify-center sm:justify-start gap-2">
            <Globe className="w-4 h-4" />
            ENVIRONMENTAL IMPACT
          </h3>
          <p className="text-foreground/90 text-sm sm:text-base md:text-lg leading-relaxed">
            We have prevented an estimated <span className="text-primary font-bold kiosk-glow">{stats.co2Offset.toFixed(2)} kg</span> of CO2 from entering the atmosphere!
          </p>
        </div>
      </motion.div>
    </div>
  );
};
