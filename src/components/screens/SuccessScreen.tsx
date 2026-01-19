import { useEffect } from "react";
import { motion } from "framer-motion";

interface SuccessScreenProps {
  onComplete: () => void;
  depositCount: number;
}

const SuccessScreen = ({ onComplete, depositCount }: SuccessScreenProps) => {
  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timeout = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
    >
      <motion.div
        className="bg-primary rounded-3xl p-10 md:p-16 text-center shadow-2xl"
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
          className="mb-6"
        >
          <span className="text-6xl md:text-8xl">✓</span>
        </motion.div>
        
        <motion.h2
          className="text-primary-foreground text-2xl md:text-4xl mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          THANK YOU!
        </motion.h2>
        
        <motion.p
          className="text-primary-foreground/80 text-sm md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          YOUR DEPOSIT WAS<br />SUCCESSFUL
        </motion.p>

        <motion.p
          className="text-primary-foreground/60 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          ITEMS DEPOSITED: {depositCount}
        </motion.p>
      </motion.div>

      <motion.p
        className="text-muted-foreground text-xs mt-8"
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
