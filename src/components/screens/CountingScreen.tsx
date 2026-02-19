import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KioskButton from "../KioskButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { playSuccessSound, playErrorSound } from "@/lib/soundUtils";
import { PostDepositModal } from "../PostDepositModal";

interface CountingScreenProps {
  onDone: (count: number) => void;
  userLrn: string;
  userName: string;
  userSection: string;
}

const CountingScreen = ({ onDone, userLrn, userName, userSection }: CountingScreenProps) => {
  const [count, setCount] = useState(0);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const scanningRef = useRef(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, []);

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

  const syncPointToDatabase = useCallback(async () => {
    try {
      const { error } = await supabase.rpc("increment_points", {
        student_lrn: userLrn,
        student_name: userName,
        points_to_add: 1,
        student_section: userSection || null,
      } as any);
      if (error) throw error;
    } catch (err) {
      console.error("Error syncing point to database:", err);
      toast({
        title: "Sync Error",
        description: "Failed to sync point. Will retry on next scan.",
        variant: "destructive",
      });
    }
  }, [userLrn, userName, userSection]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      const code = hiddenInputRef.current?.value.trim();
      if (hiddenInputRef.current) hiddenInputRef.current.value = "";
      if (!code || scanningRef.current) return;

      // Anti-Double Scan Logic
      const now = Date.now();
      if (code === lastScannedCode && now - lastScanTime < 3000) {
        toast({
          title: "Already scanned",
          description: "Please scan next item.",
          className: "bg-yellow-500 text-white",
        });
        return;
      }

      setLastScannedCode(code);
      setLastScanTime(now);

      scanningRef.current = true;
      try {
        const { data: product, error } = await supabase
          .from("allowed_products" as any)
          .select("*")
          .eq("barcode", code)
          .maybeSingle();

        if (error) {
          console.error("Barcode lookup error:", error);
          toast({ title: "Lookup Error", description: "Could not verify barcode.", variant: "destructive" });
          return;
        }

        if (!product) {
          playErrorSound();
          const display = document.querySelector(".kiosk-display");
          if (display) {
            display.classList.add("shake");
            setTimeout(() => display.classList.remove("shake"), 400);
          }
          toast({ title: "Unknown Item", description: "This barcode is not in our system.", variant: "destructive" });
          return;
        }

        const p = product as any;
        if (p.category !== "bottle") {
          playErrorSound();
          const display = document.querySelector(".kiosk-display");
          if (display) {
            display.classList.add("shake");
            setTimeout(() => display.classList.remove("shake"), 400);
          }
          toast({
            title: "Rejected",
            description: `${p.name} is not a bottle.`,
          });
          return;
        }

        // Valid bottle
        playSuccessSound();
        setCount((prev) => prev + 1);
        toast({ title: "Accepted", description: `${p.name} (+1 Point)` });
        syncPointToDatabase();
        supabase
          .from("scan_logs")
          .insert({ lrn: userLrn, section: userSection || null, points_added: 1, product_name: p.name } as any)
          .then(({ error }) => {
            if (error) console.error("Error logging scan:", error);
          });
      } finally {
        scanningRef.current = false;
      }
    },
    [syncPointToDatabase, userLrn, userSection, lastScannedCode, lastScanTime]
  );

  return (
    <motion.div
      className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
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

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.3 }}>
        <KioskButton onClick={() => count > 0 ? setShowPostModal(true) : onDone(count)} size="medium" className={count > 0 ? "animate-pulse-glow" : ""}>
          DONE
        </KioskButton>
      </motion.div>

      <AnimatePresence>
        {showPostModal && (
          <PostDepositModal
            userLrn={userLrn}
            onClose={() => onDone(count)}
          />
        )}
      </AnimatePresence>

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
