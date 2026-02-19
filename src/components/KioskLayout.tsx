import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KioskLogo from "./KioskLogo";
import citySilhouette from "@/assets/city-silhouette.jpg";
import { SuggestionBox } from "./SuggestionBox";

interface KioskLayoutProps {
  children: ReactNode;
  showLogo?: boolean;
}

const KioskLayout = ({ children, showLogo = true }: KioskLayoutProps) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Background image overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(${citySilhouette})` }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-12">
        {showLogo && (
          <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
            <KioskLogo />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            className="flex-1 flex flex-col items-center justify-center w-full max-w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
        <SuggestionBox />
      </div>
    </div>
  );
};

export default KioskLayout;
