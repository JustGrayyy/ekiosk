import { motion } from "framer-motion";
import KioskButton from "../KioskButton";

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-12"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <motion.p 
        className="text-foreground/70 text-sm md:text-base text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        TOUCH TO BEGIN YOUR DEPOSIT
      </motion.p>
      
      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <KioskButton onClick={onStart} className="animate-pulse-glow">
          START
        </KioskButton>
      </motion.div>
    </motion.div>
  );
};

export default StartScreen;
