import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Timer, CheckCircle2, XCircle, Heart, Brain } from "lucide-react";
import KioskButton from "./KioskButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { playSuccessSound, playErrorSound } from "@/lib/soundUtils";

const TRIVIA_QUESTIONS = [
  {
    "id": 1,
    "question": "What percentage of all plastic ever made has actually been recycled?",
    "options": ["About 9%", "About 25%", "About 50%"],
    "correctAnswer": "About 9%",
    "explanation": "Only ~9% of plastic is recycled globally, which is why your kiosk is so important!"
  },
  {
    "id": 2,
    "question": "How long does a standard plastic bottle take to decompose?",
    "options": ["50 years", "450 years", "1,000 years"],
    "correctAnswer": "450 years",
    "explanation": "PET plastic takes up to 450 years to break down in a landfill."
  },
  {
    "id": 3,
    "question": "Recycling one plastic bottle saves enough energy to power a laptop for how long?",
    "options": ["10 minutes", "2 hours", "12 hours"],
    "correctAnswer": "2 hours",
    "explanation": "Recycling plastic saves massive amounts of energy compared to making new plastic."
  },
  {
    "id": 4,
    "question": "Which of these materials can be recycled infinitely without losing quality?",
    "options": ["Plastic", "Paper", "Glass"],
    "correctAnswer": "Glass",
    "explanation": "Unlike plastic and paper, glass and aluminum can be recycled forever!"
  },
  {
    "id": 5,
    "question": "What do we call hazardous plastic fragments smaller than 5 millimeters?",
    "options": ["Mini-plastics", "Microplastics", "Nano-waste"],
    "correctAnswer": "Microplastics",
    "explanation": "Microplastics pollute oceans and even enter our food chain."
  },
  {
    "id": 6,
    "question": "What does the number '1' inside the recycling triangle on a water bottle mean?",
    "options": ["Recycle once", "PET plastic", "Number 1 Quality"],
    "correctAnswer": "PET plastic",
    "explanation": "Number 1 indicates Polyethylene Terephthalate (PET), the most common plastic for beverages."
  }
];

interface PostDepositModalProps {
  userLrn: string;
  onClose: () => void;
}

export const PostDepositModal: React.FC<PostDepositModalProps> = ({ userLrn, onClose }) => {
  // Use useMemo to ensure the type and trivia are calculated only once on mount
  const { type, trivia } = React.useMemo(() => ({
    type: Math.random() < 0.5 ? "trivia" : "sentiment",
    trivia: TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)]
  }), []);

  const [timeLeft, setTimeLeft] = useState(5);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (type === "trivia" && !answered && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (type === "trivia" && timeLeft === 0 && !answered) {
      handleTriviaAnswer(null);
    }
  }, [type, timeLeft, answered]);

  const handleSentiment = async (feeling: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("sentiment_logs" as any).insert([{ feeling }]);
      if (error) throw error;
      playSuccessSound();
      toast({ title: "Thanks for sharing!", description: "Every action counts." });
      onClose();
    } catch (err: any) {
      console.error("Sentiment error:", err.message);
      onClose();
    }
  };

  const handleTriviaAnswer = async (selected: string | null) => {
    if (answered) return;
    setAnswered(true);
    const correct = selected === trivia.correctAnswer;
    setIsCorrect(correct);
    setIsSubmitting(true);

    try {
      await supabase.from("trivia_logs" as any).insert([{
        question_id: trivia.id,
        is_correct: correct
      }]);

      if (correct) {
        await supabase.rpc("increment_points", {
          student_lrn: userLrn,
          student_name: "",
          points_to_add: 1,
          student_section: null
        } as any);
        playSuccessSound();
      } else {
        playErrorSound();
      }

      setTimeout(onClose, 3000);
    } catch (err: any) {
      console.error("Trivia error:", err.message);
      setTimeout(onClose, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="kiosk-panel w-full max-w-lg p-8 relative rounded-3xl border-4 border-primary/30"
      >
        {type === "sentiment" ? (
          <div className="text-center space-y-8">
            <h2 className="text-2xl font-bold text-primary kiosk-glow flex items-center justify-center gap-3">
              <Heart className="animate-pulse" />
              AWESOME JOB!
            </h2>
            <p className="text-xl text-foreground">How do you feel after recycling today?</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Happy", emoji: "😊" },
                { label: "Proud", emoji: "🦸" },
                { label: "Neutral", emoji: "😐" }
              ].map((item) => (
                <button
                  key={item.label}
                  disabled={isSubmitting}
                  onClick={() => handleSentiment(item.label)}
                  className="kiosk-panel hover:bg-primary/10 transition-colors p-6 flex flex-col items-center gap-3 group"
                >
                  <span className="text-5xl group-hover:scale-125 transition-transform">{item.emoji}</span>
                  <span className="text-sm font-bold text-primary">{item.label.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Brain className="w-6 h-6" />
                ECO-TRIVIA
              </h2>
              {!answered && (
                <div className="flex items-center gap-2 text-primary font-mono bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <Timer className="w-4 h-4 animate-spin-slow" />
                  {timeLeft}S
                </div>
              )}
            </div>

            <p className="text-lg text-foreground font-medium leading-relaxed">
              {trivia.question}
            </p>

            <div className="space-y-3">
              {trivia.options.map((option) => (
                <button
                  key={option}
                  disabled={answered}
                  onClick={() => handleTriviaAnswer(option)}
                  className={`w-full p-4 rounded-xl text-left border-2 transition-all flex justify-between items-center ${
                    answered
                      ? option === trivia.correctAnswer
                        ? "border-green-500 bg-green-500/10 text-green-500"
                        : option === (answered && !isCorrect && option === trivia.correctAnswer ? trivia.correctAnswer : "") 
                          ? "" 
                          : "border-primary/10 opacity-50"
                      : "border-primary/20 hover:border-primary hover:bg-primary/5 text-foreground"
                  }`}
                >
                  <span className="font-bold">{option}</span>
                  {answered && option === trivia.correctAnswer && <CheckCircle2 className="w-5 h-5" />}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`p-4 rounded-xl border-2 ${isCorrect ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}
                >
                  <div className="flex gap-3">
                    {isCorrect ? <Trophy className="w-6 h-6 text-green-500" /> : <AlertCircle className="w-6 h-6 text-yellow-500" />}
                    <div>
                      <p className={`font-bold ${isCorrect ? "text-green-500" : "text-yellow-500"}`}>
                        {isCorrect ? "CORRECT! +1 BONUS POINT" : "NICE TRY!"}
                      </p>
                      <p className="text-sm text-foreground/80 mt-1">{trivia.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};
