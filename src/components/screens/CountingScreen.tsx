import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import KioskButton from "../KioskButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CountingScreenProps {
  onDone: (count: number) => void;
  userLrn: string;
  userName: string;
}

const CountingScreen = ({ onDone, userLrn, userName }: CountingScreenProps) => {
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

  // Sync points to database using atomic increment
  const syncPointToDatabase = useCallback(async () => {
    try {
      // Use atomic increment function to prevent race conditions
      const { error } = await supabase.rpc("increment_points", {
        student_lrn: userLrn,
        student_name: userName,
        points_to_add: 1,
      });

      if (error) throw error;
    } catch (err) {
      console.error("Error syncing point to database:", err);
      toast({
        title: "Sync Error",
        description: "Failed to sync point. Will retry on next scan.",
        variant: "destructive",
      });
    }
  }, [userLrn, userName]);

  // Handle barcode scanner input (Enter key triggers count)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const code = hiddenInputRef.current?.value.trim();
        if (code) {
          // Optimistic update: increment local count immediately
          setCount((prev) => prev + 1);
          // Sync to database in background
          syncPointToDatabase();
        }
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = "";
        }
      }
    },
    [syncPointToDatabase]
  );

  return (
    <motion.div
      className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hidden input for barcode scanner */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="none"
        className="absolute opacity-0 -z-10"
        style={{ position: "absolute", left: "-9999px" }}
        onKeyDown={handleKeyDown}
        aria-hidden="true"
        tabIndex={-1}
      />

      <motion.p
        className="text-foreground text-center text-[10px] sm:text-xs md:text-sm lg:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        SCAN YOUR ITEMS...
      </motion.p>

      <motion.div
        className="kiosk-display rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 min-w-[200px] sm:min-w-[260px] md:min-w-[300px]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="text-center">
          <p className="text-foreground text-[10px] sm:text-xs md:text-sm mb-2 sm:mb-3 md:mb-4">TOTAL ITEMS</p>
          <motion.p
            key={count}
            className="text-primary text-3xl sm:text-4xl md:text-5xl lg:text-7xl kiosk-glow"
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
        className="text-muted-foreground text-[8px] sm:text-[10px] md:text-xs text-center max-w-[200px] sm:max-w-xs"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        SCANNER READY - SCAN BARCODES TO COUNT
      </motion.p>
    </motion.div>
  );
};

export default CountingScreen;
