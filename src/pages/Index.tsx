import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import KioskLayout from "@/components/KioskLayout";
import StartScreen from "@/components/screens/StartScreen";
import AccountScreen from "@/components/screens/AccountScreen";
import DepositScreen from "@/components/screens/DepositScreen";
import CountingScreen from "@/components/screens/CountingScreen";
import SuccessScreen from "@/components/screens/SuccessScreen";
import CheckPointsScreen from "@/components/screens/CheckPointsScreen";

type Screen = "start" | "account" | "deposit" | "counting" | "success" | "checkPoints";

interface UserData {
  name: string;
  lrn: string;
  section: string;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("start");
  const [userData, setUserData] = useState<UserData>({ name: "", lrn: "", section: "" });
  const [depositCount, setDepositCount] = useState(0);

  const handleStart = useCallback(() => {
    setCurrentScreen("account");
  }, []);

  const handleCheckPoints = useCallback(() => {
    setCurrentScreen("checkPoints");
  }, []);

  const handleBackToStart = useCallback(() => {
    setCurrentScreen("start");
  }, []);

  const handleAccountSubmit = useCallback((name: string, lrn: string, section: string) => {
    setUserData({ name, lrn, section });
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
    setUserData({ name: "", lrn: "", section: "" });
    setDepositCount(0);
    setCurrentScreen("start");
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case "start":
        return <StartScreen key="start" onStart={handleStart} onCheckPoints={handleCheckPoints} />;
      case "checkPoints":
        return <CheckPointsScreen key="checkPoints" onBack={handleBackToStart} />;
      case "account":
        return <AccountScreen key="account" onSubmit={handleAccountSubmit} />;
      case "deposit":
        return <DepositScreen key="deposit" onDeposit={handleDeposit} userName={userData.name} />;
      case "counting":
        return <CountingScreen key="counting" onDone={handleCountingDone} userLrn={userData.lrn} userName={userData.name} userSection={userData.section} />;
      case "success":
        return <SuccessScreen key="success" onComplete={handleComplete} depositCount={depositCount} pointsEarned={depositCount} />;
      default:
        return <StartScreen key="start" onStart={handleStart} onCheckPoints={handleCheckPoints} />;
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
