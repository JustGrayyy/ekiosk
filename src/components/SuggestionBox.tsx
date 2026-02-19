import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";
import KioskButton from "./KioskButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SuggestionBoxProps {}

export const SuggestionBox: React.FC<SuggestionBoxProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("suggestions")
        .insert([{ message: message.trim() }]);

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your suggestion has been submitted successfully.",
      });
      setMessage("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to submit suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground p-3 sm:p-4 rounded-full shadow-lg hover:scale-110 transition-transform animate-pulse-glow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="kiosk-panel w-full max-w-md p-6 relative rounded-2xl border-2 border-primary/20"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold text-primary mb-4 kiosk-glow flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                SUGGESTIONS
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can improve E-KIOSK..."
                  className="w-full h-32 bg-background/50 border-2 border-primary/20 rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  autoFocus
                />
                
                <KioskButton
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "SENDING..." : "SUBMIT SUGGESTION"}
                </KioskButton>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
