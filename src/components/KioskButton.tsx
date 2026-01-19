import { motion } from "framer-motion";
import { ReactNode } from "react";

interface KioskButtonProps {
  children: ReactNode;
  onClick: () => void;
  size?: "large" | "medium";
  className?: string;
}

const KioskButton = ({ children, onClick, size = "large", className = "" }: KioskButtonProps) => {
  const sizeClasses = size === "large" 
    ? "px-16 py-6 text-xl md:text-2xl min-w-[280px]" 
    : "px-12 py-4 text-lg md:text-xl min-w-[200px]";

  return (
    <motion.button
      onClick={onClick}
      className={`
        bg-primary text-primary-foreground font-bold
        rounded-full kiosk-button-glow
        transition-all duration-200
        active:scale-95
        ${sizeClasses}
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

export default KioskButton;
