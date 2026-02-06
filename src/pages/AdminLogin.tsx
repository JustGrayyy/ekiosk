import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import KioskButton from "@/components/KioskButton";
import KioskLogo from "@/components/KioskLogo";

const AdminLogin = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError("Please enter a PIN");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-admin-pin", {
        body: { pin },
      });

      if (fnError) throw fnError;

      if (data?.valid) {
        sessionStorage.setItem("admin_session", "valid");
        navigate("/admin-dashboard", { replace: true });
      } else {
        setError("Incorrect PIN");
        setPin("");
      }
    } catch (err) {
      console.error("PIN verification error:", err);
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        className="kiosk-panel w-full max-w-xs sm:max-w-sm p-6 sm:p-8 flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <KioskLogo />

        <div className="flex items-center gap-2 text-primary">
          <Lock className="w-5 h-5" />
          <h1 className="text-sm sm:text-base kiosk-glow">ADMIN ACCESS</h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={10}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            className="kiosk-input w-full text-center text-foreground text-base sm:text-lg p-3 rounded-lg tracking-[0.3em] placeholder:tracking-normal placeholder:text-muted-foreground"
            autoFocus
          />

          {error && (
            <motion.p
              className="text-destructive text-[10px] sm:text-xs text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <KioskButton type="submit" size="medium" disabled={loading} className="w-full">
            {loading ? "VERIFYING..." : "UNLOCK"}
          </KioskButton>
        </form>

        <button
          onClick={() => navigate("/")}
          className="text-muted-foreground text-[9px] sm:text-[10px] hover:text-foreground/70 transition-colors"
        >
          ← BACK TO KIOSK
        </button>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
