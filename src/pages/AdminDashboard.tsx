import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import KioskLogo from "@/components/KioskLogo";
import DailyScanChart from "@/components/admin/DailyScanChart";
import TopContributorsChart from "@/components/admin/TopContributorsChart";
import RegistrationStatusChart from "@/components/admin/RegistrationStatusChart";
import PointsEconomyChart from "@/components/admin/PointsEconomyChart";
import PeakHoursChart from "@/components/admin/PeakHoursChart";
import SemesterGoalChart from "@/components/admin/SemesterGoalChart";

const CHARTS = [
  { title: "Daily Scan Velocity", Component: DailyScanChart },
  { title: "Top 5 Contributors", Component: TopContributorsChart },
  { title: "Registration Status", Component: RegistrationStatusChart },
  { title: "Points Economy", Component: PointsEconomyChart },
  { title: "Peak Hours", Component: PeakHoursChart },
  { title: "Semester Goal", Component: SemesterGoalChart },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("admin_session") !== "valid") {
      navigate("/admin-login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_session");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <KioskLogo />
          <h1 className="text-primary text-[10px] sm:text-xs md:text-sm kiosk-glow">ADMIN DASHBOARD</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-muted-foreground text-[9px] sm:text-[10px] hover:text-foreground/70 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          LOGOUT
        </button>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {CHARTS.map(({ title, Component }, i) => (
          <motion.div
            key={title}
            className="kiosk-panel rounded-xl p-3 sm:p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <h2 className="text-primary text-[9px] sm:text-[10px] md:text-xs mb-3 kiosk-glow">{title.toUpperCase()}</h2>
            <Component />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
