import { motion } from "framer-motion";
import { ReactNode } from "react";

interface KioskButtonProps {
  children: ReactNode;
  onClick: () => void;
  size?: "large" | "medium" | "small";
  variant?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
}

const KioskButton = ({ 
  children, 
  onClick, 
  size = "large", 
  variant = "primary",
  disabled = false,
  className = "" 
}: KioskButtonProps) => {
  const sizeClasses = {
    large: "px-16 py-6 text-xl md:text-2xl min-w-[280px]",
    medium: "px-12 py-4 text-lg md:text-xl min-w-[200px]",
    small: "px-8 py-3 text-sm md:text-base min-w-[120px]",
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
