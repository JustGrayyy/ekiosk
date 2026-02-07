import { useState } from "react";
import { motion } from "framer-motion";
import KioskButton from "../KioskButton";
import { findClosestSection, VALID_SECTIONS } from "@/lib/fuzzyMatch";
import { toast } from "@/hooks/use-toast";

interface AccountScreenProps {
  onSubmit: (name: string, lrn: string, section: string) => void;
}

const AccountScreen = ({ onSubmit }: AccountScreenProps) => {
  const [name, setName] = useState("");
  const [lrn, setLrn] = useState("");
  const [section, setSection] = useState("");
  const [error, setError] = useState("");

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
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!lrn.trim()) {
      setError("Please enter your LRN");
      return;
    }
    setError("");
    // Run fuzzy match one more time on submit
    const { corrected } = findClosestSection(section, VALID_SECTIONS);
    onSubmit(name.trim(), lrn.trim(), corrected);
  };

  const handleLrnChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setLrn(numericValue);
  };

  return (
    <motion.div
      className="w-full max-w-[95%] sm:max-w-md md:max-w-lg px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="kiosk-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10">
        <motion.h2
          className="text-primary text-center text-xs sm:text-sm md:text-base lg:text-xl mb-4 sm:mb-6 md:mb-8 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          TYPE IN YOUR<br />ACCOUNT INFORMATION
        </motion.h2>

        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <label className="text-foreground text-[10px] sm:text-xs md:text-sm">NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full kiosk-input rounded-lg px-3 sm:px-4 py-3 sm:py-4 text-foreground text-sm sm:text-base md:text-lg outline-none transition-all min-h-[44px]"
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <label className="text-foreground text-[10px] sm:text-xs md:text-sm">LRN</label>
            <input
              type="text"
              inputMode="numeric"
              value={lrn}
              onChange={(e) => handleLrnChange(e.target.value)}
              className="w-full kiosk-input rounded-lg px-3 sm:px-4 py-3 sm:py-4 text-foreground text-sm sm:text-base md:text-lg outline-none transition-all min-h-[44px]"
              placeholder="Enter your LRN"
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
        </div>

        <div className="mt-6 sm:mt-7 md:mt-8 flex justify-center">
          <KioskButton onClick={handleSubmit} size="medium">
            ENTER
          </KioskButton>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountScreen;
