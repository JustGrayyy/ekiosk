import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { QrCode } from "lucide-react";
import KioskButton from "../KioskButton";
import QrScannerModal from "../QrScannerModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DepositScreenProps {
  onDeposit: () => void;
  userName: string;
}

const DepositScreen = ({ onDeposit, userName }: DepositScreenProps) => {
  const [lrn, setLrn] = useState("");
  const [isLrnLocked, setIsLrnLocked] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);

  const handleQrScan = useCallback(async (scannedLrn: string) => {
    if (!/^\d+$/.test(scannedLrn)) {
      toast({
        title: "Invalid LRN",
        description: "Only numeric LRNs are accepted.",
        variant: "destructive",
      });
      return;
    }
    setLrn(scannedLrn);
    setIsLrnLocked(true);
    setShowQrScanner(false);
    toast({
      title: "LRN Scanned",
      description: "Student ID identified successfully.",
    });
  }, []);

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
        <div className="flex flex-col items-center gap-4 mb-6">
          <p className="text-foreground text-center text-[10px] sm:text-xs md:text-sm">
            VERIFY STUDENT LRN
          </p>
          <div className="relative w-full">
            <input
              type="text"
              inputMode="numeric"
              value={lrn}
              disabled={isLrnLocked}
              onChange={(e) => setLrn(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-background border-2 border-primary/50 rounded-lg sm:rounded-xl p-3 text-center text-lg text-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              placeholder="Enter or Scan LRN"
              maxLength={12}
            />
            {!isLrnLocked && (
              <button
                type="button"
                onClick={() => setShowQrScanner(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary/80 transition-colors"
              >
                <QrCode className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        <p className="text-foreground text-center text-[10px] sm:text-xs md:text-sm mb-4 sm:mb-5 md:mb-6">
          SELECT YOUR TRANSACTION
        </p>
        
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <KioskButton onClick={onDeposit} className="animate-pulse-glow" disabled={!lrn}>
            DEPOSIT
          </KioskButton>
        </motion.div>
      </motion.div>

      <QrScannerModal
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onScan={handleQrScan}
      />
    </motion.div>
  );
};

export default DepositScreen;
