import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import KioskButton from "../KioskButton";

interface StartScreenProps {
  onStart: () => void;
  onCheckPoints: () => void;
}

const StartScreen = ({ onStart, onCheckPoints }: StartScreenProps) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 px-2"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <motion.p 
        className="text-foreground/70 text-[10px] sm:text-xs md:text-sm lg:text-base text-center max-w-xs sm:max-w-sm md:max-w-md px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        TOUCH TO BEGIN YOUR DEPOSIT
      </motion.p>
      
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <KioskButton onClick={onStart} className="animate-pulse-glow">
            START
          </KioskButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <KioskButton onClick={onCheckPoints} size="medium" variant="secondary">
            CHECK POINTS
          </KioskButton>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StartScreen;
