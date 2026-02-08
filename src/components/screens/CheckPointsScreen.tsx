import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { QrCode } from "lucide-react";
import KioskButton from "../KioskButton";
import RedeemModal from "./RedeemModal";
import QrScannerModal from "../QrScannerModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CheckPointsScreenProps {
  onBack: () => void;
}

interface StudentData {
  lrn: string;
  full_name: string;
  points_balance: number;
}

const CheckPointsScreen = ({ onBack }: CheckPointsScreenProps) => {
  const [lrn, setLrn] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [error, setError] = useState("");
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = async () => {
    if (!lrn.trim()) {
      setError("Please enter an LRN");
      return;
    }

    setLoading(true);
    setError("");
    setStudentData(null);

    try {
      const { data, error: queryError } = await supabase
        .from("student_points")
        .select("*")
        .eq("lrn", lrn.trim())
        .maybeSingle();

      if (queryError) {
        throw queryError;
      }

      if (data) {
        setStudentData(data);
      } else {
        setError("Student not found");
      }
    } catch (err) {
      console.error("Error fetching student:", err);
      toast({
        title: "Error",
        description: "Failed to fetch student data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRedeemSuccess = (newBalance: number) => {
    if (studentData) {
      setStudentData({ ...studentData, points_balance: newBalance });
    }
  };

  const handleReset = () => {
    setLrn("");
    setStudentData(null);
    setError("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleQrScan = useCallback(async (scannedLrn: string) => {
    setLrn(scannedLrn);
    setShowQrScanner(false);
    // Auto-trigger search with the scanned LRN
    setLoading(true);
    setError("");
    setStudentData(null);
    try {
      const { data, error: queryError } = await supabase
        .from("student_points")
        .select("*")
        .eq("lrn", scannedLrn)
        .maybeSingle();
      if (queryError) throw queryError;
      if (data) {
        setStudentData(data);
      } else {
        setError("Student not found");
      }
    } catch (err) {
      console.error("Error fetching student:", err);
      toast({
        title: "Error",
        description: "Failed to fetch student data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 w-full max-w-[95%] sm:max-w-sm md:max-w-md px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h2
        className="text-primary text-base sm:text-lg md:text-xl lg:text-2xl text-center kiosk-glow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        CHECK YOUR POINTS
      </motion.h2>

      {!studentData ? (
        <>
          <motion.div
            className="kiosk-panel w-full p-4 sm:p-5 md:p-6 lg:p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-foreground text-[10px] sm:text-xs md:text-sm mb-3 sm:mb-4 text-center">
              ENTER YOUR LRN
            </p>
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={lrn}
                onChange={(e) => {
                  setLrn(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-background border-2 border-primary/50 rounded-lg sm:rounded-xl p-3 sm:p-4 pr-12 text-center text-base sm:text-lg md:text-xl text-foreground focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                placeholder="000000000000"
                maxLength={12}
              />
              <button
                type="button"
                onClick={() => setShowQrScanner(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary/80 transition-colors"
                aria-label="Scan QR Code"
              >
                <QrCode className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            {error && (
              <motion.p
                className="text-destructive text-[10px] sm:text-xs md:text-sm mt-2 sm:mt-3 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            className="flex gap-2 sm:gap-3 md:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <KioskButton onClick={onBack} size="small" variant="secondary">
              BACK
            </KioskButton>
            <KioskButton onClick={handleSearch} size="small" disabled={loading}>
              {loading ? "..." : "SEARCH"}
            </KioskButton>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div
            className="kiosk-panel w-full p-4 sm:p-5 md:p-6 lg:p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-foreground/70 text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-2 text-center">
              STUDENT NAME
            </p>
            <p className="text-primary text-sm sm:text-base md:text-lg lg:text-xl text-center mb-4 sm:mb-5 md:mb-6 kiosk-glow">
              {studentData.full_name.toUpperCase()}
            </p>

            <div className="bg-background/50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-center">
              <p className="text-foreground/70 text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-2">POINTS BALANCE</p>
              <motion.p
                key={studentData.points_balance}
                className="text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl kiosk-glow"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {studentData.points_balance.toLocaleString()}
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col gap-3 sm:gap-4 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <KioskButton
              onClick={() => setShowRedeemModal(true)}
              size="medium"
              disabled={studentData.points_balance === 0}
              className={studentData.points_balance > 0 ? "animate-pulse-glow" : ""}
            >
              REDEEM POINTS
            </KioskButton>

            <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center">
              <KioskButton onClick={handleReset} size="small" variant="secondary">
                NEW SEARCH
              </KioskButton>
              <KioskButton onClick={onBack} size="small" variant="secondary">
                BACK
              </KioskButton>
            </div>
          </motion.div>
        </>
      )}

      {showRedeemModal && studentData && (
        <RedeemModal
          studentLrn={studentData.lrn}
          currentBalance={studentData.points_balance}
          onClose={() => setShowRedeemModal(false)}
          onRedeemSuccess={handleRedeemSuccess}
        />
      )}

      <QrScannerModal
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onScan={handleQrScan}
      />
    </motion.div>
  );
};

export default CheckPointsScreen;
