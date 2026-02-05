import { motion } from "framer-motion";

const KioskLogo = () => {
  return (
    <motion.h1
      className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl text-primary kiosk-glow tracking-wider"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      E-KIOSK
    </motion.h1>
  );
};

export default KioskLogo;
