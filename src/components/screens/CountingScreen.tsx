import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import KioskButton from "../KioskButton";

interface CountingScreenProps {
  onDone: (count: number) => void;
}

const CountingScreen = ({ onDone }: CountingScreenProps) => {
  const [count, setCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate counting deposits
    const targetCount = 5;
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= targetCount) {
          clearInterval(interval);
          setIsComplete(true);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <motion.p
        className="text-foreground text-center text-sm md:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        COUNTING YOUR DEPOSIT...
      </motion.p>

      <motion.div
        className="kiosk-display rounded-2xl p-8 md:p-12 min-w-[300px]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="text-center">
          <p className="text-foreground text-sm mb-4">COUNT</p>
          <motion.p
            key={count}
            className="text-primary text-5xl md:text-7xl kiosk-glow"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {count.toString().padStart(2, "0")}
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isComplete ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
      >
        <KioskButton 
          onClick={() => onDone(count)} 
          size="medium"
          className={!isComplete ? "pointer-events-none" : "animate-pulse-glow"}
        >
          DONE
        </KioskButton>
      </motion.div>

      {!isComplete && (
        <motion.p
          className="text-muted-foreground text-xs"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          PLEASE WAIT...
        </motion.p>
      )}
    </motion.div>
  );
};

export default CountingScreen;
