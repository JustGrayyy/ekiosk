import { useEffect } from "react";
import { motion } from "framer-motion";

interface SuccessScreenProps {
  onComplete: () => void;
  depositCount: number;
  pointsEarned: number;
}

const SuccessScreen = ({ onComplete, depositCount, pointsEarned }: SuccessScreenProps) => {
  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timeout = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
    >
      <motion.div
        className="bg-primary rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-16 text-center shadow-2xl"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
        style={{
          boxShadow: "0 0 60px hsla(45, 100%, 50%, 0.4), 0 20px 60px rgba(0,0,0,0.3)"
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="mb-4 sm:mb-5 md:mb-6"
        >
          <span className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl">✓</span>
        </motion.div>
        
        <motion.h2
          className="text-primary-foreground text-lg sm:text-xl md:text-2xl lg:text-4xl mb-2 sm:mb-3 md:mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          THANK YOU!
        </motion.h2>
        
        <motion.p
          className="text-primary-foreground/80 text-[10px] sm:text-xs md:text-sm lg:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          YOUR DEPOSIT WAS<br />SUCCESSFUL
        </motion.p>

        <motion.div
          className="mt-4 sm:mt-5 md:mt-6 space-y-1 sm:space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-primary-foreground/60 text-[8px] sm:text-[10px] md:text-xs">
            ITEMS DEPOSITED: {depositCount}
          </p>
          <p className="text-primary-foreground text-[10px] sm:text-xs md:text-sm font-bold">
            POINTS EARNED: +{pointsEarned}
          </p>
        </motion.div>
      </motion.div>

      <motion.p
        className="text-muted-foreground text-[8px] sm:text-[10px] md:text-xs mt-6 sm:mt-7 md:mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        RETURNING TO START...
      </motion.p>
    </motion.div>
  );
};

export default SuccessScreen;
