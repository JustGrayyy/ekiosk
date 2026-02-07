import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Trophy, Users } from "lucide-react";
import KioskButton from "../KioskButton";
import { supabase } from "@/integrations/supabase/client";

interface StartScreenProps {
  onStart: () => void;
  onCheckPoints: () => void;
}

interface StudentEntry {
  full_name: string;
  points_balance: number | null;
}

interface SectionEntry {
  section: string;
  total_points: number;
}

const StartScreen = ({ onStart, onCheckPoints }: StartScreenProps) => {
  const navigate = useNavigate();
  const [topStudents, setTopStudents] = useState<StudentEntry[]>([]);
  const [topSections, setTopSections] = useState<SectionEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      const [studentsRes, sectionsRes] = await Promise.all([
        supabase
          .from("student_points")
          .select("full_name, points_balance")
          .order("points_balance", { ascending: false })
          .limit(10),
        supabase
          .from("student_points")
          .select("section, points_balance"),
      ]);

      if (studentsRes.data) {
        setTopStudents(studentsRes.data);
      }

      if (sectionsRes.data) {
        // Aggregate by section client-side
        const sectionMap: Record<string, number> = {};
        for (const row of sectionsRes.data) {
          const key = row.section || "Unassigned";
          sectionMap[key] = (sectionMap[key] || 0) + (row.points_balance || 0);
        }
        const sorted = Object.entries(sectionMap)
          .map(([section, total_points]) => ({ section, total_points }))
          .sort((a, b) => b.total_points - a.total_points)
          .slice(0, 10);
        setTopSections(sorted);
      }
    };

    fetchLeaderboards();
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 px-2 w-full max-w-4xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <motion.p
        className="text-foreground/70 text-[10px] sm:text-xs md:text-sm lg:text-base text-center max-w-xs sm:max-w-sm md:max-w-md px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        TOUCH TO BEGIN YOUR DEPOSIT
      </motion.p>

      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <KioskButton onClick={onStart} className="animate-pulse-glow">
            START
          </KioskButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <KioskButton onClick={onCheckPoints} size="medium" variant="secondary">
            CHECK POINTS
          </KioskButton>
        </motion.div>
      </div>

      {/* Dual Leaderboards */}
      <motion.div
        className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Top Students */}
        <div className="kiosk-panel rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-primary text-[9px] sm:text-[10px] md:text-xs kiosk-glow">TOP STUDENTS</h3>
          </div>
          {topStudents.length === 0 ? (
            <p className="text-muted-foreground text-[8px] sm:text-[9px] text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-1">
              {topStudents.map((s, i) => (
                <div key={i} className="flex justify-between items-center text-[8px] sm:text-[9px] md:text-[10px] py-0.5">
                  <span className="text-foreground/70 truncate mr-2">
                    <span className="text-primary mr-1">{i + 1}.</span>
                    {s.full_name}
                  </span>
                  <span className="text-primary font-mono">{s.points_balance ?? 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Sections */}
        <div className="kiosk-panel rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-primary text-[9px] sm:text-[10px] md:text-xs kiosk-glow">TOP SECTIONS</h3>
          </div>
          {topSections.length === 0 ? (
            <p className="text-muted-foreground text-[8px] sm:text-[9px] text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-1">
              {topSections.map((s, i) => (
                <div key={i} className="flex justify-between items-center text-[8px] sm:text-[9px] md:text-[10px] py-0.5">
                  <span className="text-foreground/70 truncate mr-2">
                    <span className="text-primary mr-1">{i + 1}.</span>
                    {s.section}
                  </span>
                  <span className="text-primary font-mono">{s.total_points}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.button
        onClick={() => navigate("/admin-login")}
        className="flex items-center gap-1 text-muted-foreground/40 text-[8px] hover:text-muted-foreground/70 transition-colors mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Lock className="w-2.5 h-2.5" />
        Admin Access
      </motion.button>
    </motion.div>
  );
};

export default StartScreen;
