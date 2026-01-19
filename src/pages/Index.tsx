import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import KioskLayout from "@/components/KioskLayout";
import StartScreen from "@/components/screens/StartScreen";
import AccountScreen from "@/components/screens/AccountScreen";
import DepositScreen from "@/components/screens/DepositScreen";
import CountingScreen from "@/components/screens/CountingScreen";
import SuccessScreen from "@/components/screens/SuccessScreen";

type Screen = "start" | "account" | "deposit" | "counting" | "success";

interface UserData {
  name: string;
  lrn: string;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("start");
  const [userData, setUserData] = useState<UserData>({ name: "", lrn: "" });
  const [depositCount, setDepositCount] = useState(0);

  const handleStart = useCallback(() => {
    setCurrentScreen("account");
  }, []);

  const handleAccountSubmit = useCallback((name: string, lrn: string) => {
    setUserData({ name, lrn });
    setCurrentScreen("deposit");
  }, []);

  const handleDeposit = useCallback(() => {
    setCurrentScreen("counting");
  }, []);

  const handleCountingDone = useCallback((count: number) => {
    setDepositCount(count);
    setCurrentScreen("success");
  }, []);

  const handleComplete = useCallback(() => {
    // Reset all state and go back to start
    setUserData({ name: "", lrn: "" });
    setDepositCount(0);
    setCurrentScreen("start");
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case "start":
        return <StartScreen key="start" onStart={handleStart} />;
      case "account":
        return <AccountScreen key="account" onSubmit={handleAccountSubmit} />;
      case "deposit":
        return <DepositScreen key="deposit" onDeposit={handleDeposit} userName={userData.name} />;
      case "counting":
        return <CountingScreen key="counting" onDone={handleCountingDone} />;
      case "success":
        return <SuccessScreen key="success" onComplete={handleComplete} depositCount={depositCount} />;
      default:
        return <StartScreen key="start" onStart={handleStart} />;
    }
  };

  return (
    <KioskLayout>
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </KioskLayout>
  );
};

export default Index;
