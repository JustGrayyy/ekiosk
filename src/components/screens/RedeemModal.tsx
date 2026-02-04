import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KioskButton from "../KioskButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RedeemModalProps {
  studentLrn: string;
  currentBalance: number;
  onClose: () => void;
  onRedeemSuccess: (newBalance: number) => void;
}

interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: string;
}

const REWARDS: Reward[] = [
  { id: "supplies", name: "School Supplies Pack", cost: 50, icon: "📚" },
  { id: "canteen", name: "Canteen Voucher", cost: 100, icon: "🍔" },
  { id: "premium", name: "Premium Item", cost: 200, icon: "🎁" },
];

const RedeemModal = ({
  studentLrn,
  currentBalance,
  onClose,
  onRedeemSuccess,
}: RedeemModalProps) => {
  const [loading, setLoading] = useState(false);
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [redeemedReward, setRedeemedReward] = useState<Reward | null>(null);

  const generateClaimCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleRedeem = async (reward: Reward) => {
    if (currentBalance < reward.cost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.cost - currentBalance} more points for this reward.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const newBalance = currentBalance - reward.cost;

      const { error } = await supabase
        .from("student_points")
        .update({ points_balance: newBalance })
        .eq("lrn", studentLrn);

      if (error) throw error;

      const code = generateClaimCode();
      setClaimCode(code);
      setRedeemedReward(reward);
      onRedeemSuccess(newBalance);

      toast({
        title: "Redemption Successful!",
        description: `Your claim code is: ${code}`,
      });
    } catch (err) {
      console.error("Error redeeming reward:", err);
      toast({
        title: "Error",
        description: "Failed to redeem reward. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Modal */}
      <motion.div
        className="kiosk-panel relative z-10 w-full max-w-md p-6 md:p-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <AnimatePresence mode="wait">
          {!claimCode ? (
            <motion.div
              key="rewards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-primary text-xl md:text-2xl text-center mb-2 kiosk-glow">
                REDEEM REWARDS
              </h3>
              <p className="text-foreground/70 text-sm text-center mb-6">
                YOUR BALANCE: <span className="text-primary">{currentBalance} PTS</span>
              </p>

              <div className="space-y-4">
                {REWARDS.map((reward) => {
                  const canAfford = currentBalance >= reward.cost;
                  return (
                    <motion.button
                      key={reward.id}
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford || loading}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        canAfford
                          ? "border-primary/50 bg-background/50 hover:border-primary hover:bg-primary/10"
                          : "border-muted/30 bg-muted/10 opacity-50 cursor-not-allowed"
                      }`}
                      whileHover={canAfford ? { scale: 1.02 } : {}}
                      whileTap={canAfford ? { scale: 0.98 } : {}}
                    >
                      <span className="text-3xl">{reward.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="text-foreground text-sm md:text-base">
                          {reward.name}
                        </p>
                        <p className={`text-sm ${canAfford ? "text-primary" : "text-muted-foreground"}`}>
                          {reward.cost} PTS
                        </p>
                      </div>
                      {!canAfford && (
                        <span className="text-xs text-muted-foreground">
                          NEED {reward.cost - currentBalance} MORE
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-center">
                <KioskButton onClick={onClose} size="small" variant="secondary">
                  CLOSE
                </KioskButton>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className="text-5xl mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                🎉
              </motion.div>
              <h3 className="text-primary text-xl md:text-2xl mb-2 kiosk-glow">
                REDEMPTION SUCCESSFUL!
              </h3>
              <p className="text-foreground/70 text-sm mb-4">
                {redeemedReward?.name}
              </p>

              <div className="bg-background/50 rounded-xl p-4 mb-6">
                <p className="text-foreground/70 text-xs mb-1">YOUR CLAIM CODE</p>
                <p className="text-primary text-2xl md:text-3xl font-bold tracking-widest kiosk-glow">
                  {claimCode}
                </p>
              </div>

              <p className="text-muted-foreground text-xs mb-6">
                Present this code at the counter to claim your reward
              </p>

              <KioskButton onClick={onClose} size="small">
                DONE
              </KioskButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default RedeemModal;
