import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import KioskButton from "../KioskButton";

interface CountingScreenProps {
  onDone: (count: number) => void;
}

const CountingScreen = ({ onDone }: CountingScreenProps) => {
  const [count, setCount] = useState(0);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the hidden input on mount
  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, []);

  // Re-focus input when clicking anywhere except buttons
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "BUTTON" && hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Handle barcode scanner input (Enter key triggers count)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const code = hiddenInputRef.current?.value.trim();
      if (code) {
        setCount((prev) => prev + 1);
      }
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = "";
      }
    }
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hidden input for barcode scanner */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="absolute opacity-0 -z-10"
        style={{ position: "absolute", left: "-9999px" }}
        onKeyDown={handleKeyDown}
        aria-hidden="true"
        tabIndex={-1}
      />

      <motion.p
        className="text-foreground text-center text-sm md:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        SCAN YOUR ITEMS...
      </motion.p>

      <motion.div
        className="kiosk-display rounded-2xl p-8 md:p-12 min-w-[300px]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="text-center">
          <p className="text-foreground text-sm mb-4">TOTAL ITEMS</p>
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
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <KioskButton
          onClick={() => onDone(count)}
          size="medium"
          className={count > 0 ? "animate-pulse-glow" : ""}
        >
          DONE
        </KioskButton>
      </motion.div>

      <motion.p
        className="text-muted-foreground text-xs text-center max-w-xs"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        SCANNER READY - SCAN BARCODES TO COUNT
      </motion.p>
    </motion.div>
  );
};

export default CountingScreen;
