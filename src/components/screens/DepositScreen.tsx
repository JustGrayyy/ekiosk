import { motion } from "framer-motion";
import KioskButton from "../KioskButton";

interface DepositScreenProps {
  onDeposit: () => void;
  userName: string;
}

const DepositScreen = ({ onDeposit, userName }: DepositScreenProps) => {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <motion.p
        className="text-foreground text-center text-[10px] sm:text-xs md:text-sm lg:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        WELCOME, <span className="text-primary">{userName.toUpperCase()}</span>
      </motion.p>

      <motion.div
        className="kiosk-panel rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <p className="text-foreground text-center text-[10px] sm:text-xs md:text-sm mb-4 sm:mb-5 md:mb-6">
          SELECT YOUR TRANSACTION
        </p>
        
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <KioskButton onClick={onDeposit} className="animate-pulse-glow">
            DEPOSIT
          </KioskButton>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DepositScreen;
