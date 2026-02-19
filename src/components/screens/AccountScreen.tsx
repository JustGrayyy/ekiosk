import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Loader2 } from "lucide-react";
import KioskButton from "../KioskButton";
import QrScannerModal from "../QrScannerModal";
import { findClosestSection, VALID_SECTIONS } from "@/lib/fuzzyMatch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { playErrorSound } from "@/lib/soundUtils";

interface AccountScreenProps {
  onSubmit: (name: string, lrn: string, section: string) => void;
}

const AccountScreen = ({ onSubmit }: AccountScreenProps) => {
  const [name, setName] = useState("");
  const [lrn, setLrn] = useState("");
  const [section, setSection] = useState("");
  const [error, setError] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isLrnLocked, setIsLrnLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  const normalizeSection = (value: string) => {
    if (!value.trim()) return;
    const { corrected, wasAutoCorrected } = findClosestSection(value, VALID_SECTIONS);
    if (wasAutoCorrected) {
      setSection(corrected);
      toast({
        title: `Did you mean '${corrected}'?`,
        description: "Auto-selected.",
      });
    } else if (corrected) {
      setSection(corrected);
    } else {
      playErrorSound();
      setError("SECTION NOT FOUND - PLEASE CHECK SPELLING");
    }
  };

  const handleLrnSubmit = async (targetLrn: string) => {
    if (!targetLrn.trim()) {
      playErrorSound();
      setError("Please enter your LRN");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: student, error: queryError } = await supabase
        .from("student_points")
        .select("*")
        .eq("lrn", targetLrn.trim())
        .maybeSingle();

      if (queryError) throw queryError;

      if (student) {
        toast({
          title: `Welcome back, ${student.full_name}!`,
          description: "Redirecting to deposit...",
        });
        onSubmit(student.full_name, student.lrn, student.section || "");
      } else {
        setShowRegistration(true);
      }
    } catch (err) {
      console.error("Error checking LRN:", err);
      playErrorSound();
      toast({
        title: "Error",
        description: "Failed to verify LRN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!name.trim()) {
      playErrorSound();
      setError("Please enter your name");
      return;
    }
    if (!lrn.trim()) {
      playErrorSound();
      setError("Please enter your LRN");
      return;
    }
    setError("");
    const { corrected } = findClosestSection(section, VALID_SECTIONS);
    onSubmit(name.trim(), lrn.trim(), corrected);
  };

  const handleLrnChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setLrn(numericValue);
  };

  const handleQrScan = useCallback(async (scannedLrn: string) => {
    if (!/^\d+$/.test(scannedLrn)) {
      playErrorSound();
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
    handleLrnSubmit(scannedLrn);
  }, []);

  return (
    <motion.div
      className="w-full max-w-[95%] sm:max-w-md md:max-w-lg px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`kiosk-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 ${error ? "shake" : ""}`}>
        <motion.h2
          className="text-primary text-center text-xs sm:text-sm md:text-base lg:text-xl mb-4 sm:mb-6 md:mb-8 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {showRegistration ? "NEW STUDENT REGISTRATION" : "TYPE IN YOUR ACCOUNT INFORMATION"}
        </motion.h2>

        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <label className="text-foreground text-[10px] sm:text-xs md:text-sm">LRN</label>
            <div className="relative w-full">
              <input
                type="text"
                inputMode="numeric"
                value={lrn}
                disabled={loading}
                onChange={(e) => handleLrnChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !showRegistration && handleLrnSubmit(lrn)}
                className={`w-full kiosk-input rounded-lg px-3 sm:px-4 py-3 sm:py-4 pr-12 text-foreground text-sm sm:text-base md:text-lg outline-none transition-all min-h-[44px] disabled:opacity-70 ${error ? "border-destructive" : ""}`}
                placeholder="Enter or Scan LRN"
                maxLength={12}
              />
              {!loading && !showRegistration && (
                <button
                  type="button"
                  onClick={() => setShowQrScanner(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <QrCode className="h-6 w-6" />
                </button>
              )}
              {loading && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <label className="text-foreground text-[10px] sm:text-xs md:text-sm">FULL NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full kiosk-input rounded-lg px-3 sm:px-4 py-3 sm:py-4 text-foreground text-sm sm:text-base md:text-lg outline-none transition-all min-h-[44px]"
              placeholder="First Last"
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <label className="text-foreground text-[10px] sm:text-xs md:text-sm">SECTION (OPTIONAL)</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              onBlur={(e) => normalizeSection(e.target.value)}
              className="w-full kiosk-input rounded-lg px-3 sm:px-4 py-3 sm:py-4 text-foreground text-sm sm:text-base md:text-lg outline-none transition-all min-h-[44px]"
              placeholder="e.g. Prowess, Fortitude..."
            />
          </div>

          {error && (
            <motion.p
              className="text-destructive text-[10px] sm:text-xs md:text-sm text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <div className="mt-6 sm:mt-7 md:mt-8 flex gap-4 justify-center">
            <KioskButton 
              onClick={() => showRegistration ? handleManualSubmit() : handleLrnSubmit(lrn)} 
              size="medium" 
              disabled={loading}
            >
              {loading ? "CHECKING..." : (showRegistration ? "REGISTER" : "NEXT")}
            </KioskButton>
          </div>
        </div>
      </div>

      <QrScannerModal
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onScan={handleQrScan}
      />
    </motion.div>
  );
};

export default AccountScreen;
