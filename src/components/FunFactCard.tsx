import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Leaf, RefreshCw } from "lucide-react";
import { getRandomFact } from "@/lib/ecoFacts";

const FunFactCard = () => {
  const [{ fact, index }, setFact] = useState(() => getRandomFact());

  const handleNewFact = useCallback(() => {
    setFact(getRandomFact(index));
  }, [index]);

  return (
    <motion.div
      className="w-full rounded-xl border border-green-700/30 bg-green-900/20 p-3 sm:p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-green-400 text-[9px] sm:text-[10px] md:text-xs font-semibold tracking-wide">
              DID YOU KNOW?
            </h4>
            <button
              onClick={handleNewFact}
              className="text-green-400/60 hover:text-green-400 transition-colors p-1"
              aria-label="Show another fact"
            >
              <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
          <p className="text-foreground/70 text-[8px] sm:text-[9px] md:text-[10px] italic leading-relaxed">
            {fact}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default FunFactCard;
