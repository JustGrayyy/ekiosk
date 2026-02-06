import { motion } from "framer-motion";
import { ReactNode } from "react";

interface KioskButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  size?: "large" | "medium" | "small";
  variant?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
}

const KioskButton = ({ 
  children, 
  onClick, 
  type = "button",
  size = "large", 
  variant = "primary",
  disabled = false,
  className = "" 
}: KioskButtonProps) => {
  const sizeClasses = {
    large: "px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 text-sm sm:text-lg md:text-xl lg:text-2xl min-w-[200px] sm:min-w-[240px] md:min-w-[280px] min-h-[52px] sm:min-h-[56px] md:min-h-[64px]",
    medium: "px-6 sm:px-10 md:px-12 py-3 sm:py-4 text-xs sm:text-base md:text-lg lg:text-xl min-w-[160px] sm:min-w-[180px] md:min-w-[200px] min-h-[48px] sm:min-h-[52px] md:min-h-[56px]",
    small: "px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-[10px] sm:text-xs md:text-sm lg:text-base min-w-[100px] sm:min-w-[110px] md:min-w-[120px] min-h-[44px]",
  }[size];

  const variantClasses = variant === "primary"
    ? "bg-primary text-primary-foreground"
    : "bg-secondary text-secondary-foreground border-2 border-primary/30";

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses} font-bold
        rounded-full kiosk-button-glow
        transition-all duration-200
        active:scale-95
        ${sizeClasses}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

export default KioskButton;
