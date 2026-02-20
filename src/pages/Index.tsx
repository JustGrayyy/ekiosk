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

interface IndexProps {
  isStudentPortal?: boolean;
}

const Index = ({ isStudentPortal = false }: IndexProps) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(isStudentPortal ? "checkPoints" : "start");
  const [userData, setUserData] = useState<UserData>({ name: "", lrn: "", section: "" });
  const [depositCount, setDepositCount] = useState(0);
  const [triviaBonus, setTriviaBonus] = useState(0);

  const handleStart = useCallback(() => {
    if (isStudentPortal) return;
    setCurrentScreen("account");
  }, [isStudentPortal]);

  const handleCheckPoints = useCallback(() => {
    setCurrentScreen("checkPoints");
  }, []);

  const handleBackToStart = useCallback(() => {
    setCurrentScreen(isStudentPortal ? "checkPoints" : "start");
  }, [isStudentPortal]);

  const handleAccountSubmit = useCallback((name: string, lrn: string, section: string) => {
    if (isStudentPortal) return;
    setUserData({ name, lrn, section });
    setCurrentScreen("deposit");
  }, [isStudentPortal]);

  const handleDeposit = useCallback(() => {
    if (isStudentPortal) return;
    setCurrentScreen("counting");
  }, [isStudentPortal]);

  const handleCountingDone = useCallback((count: number, bonus: number = 0) => {
    if (isStudentPortal) return;
    setDepositCount(count);
    setTriviaBonus(bonus);
    setCurrentScreen("success");
  }, [isStudentPortal]);

  const handleComplete = useCallback(() => {
    // Reset all state and go back to start
    setUserData({ name: "", lrn: "", section: "" });
    setDepositCount(0);
    setTriviaBonus(0);
    setCurrentScreen(isStudentPortal ? "checkPoints" : "start");
  }, [isStudentPortal]);

  const renderScreen = () => {
    switch (currentScreen) {
      case "start":
        return <StartScreen key="start" onStart={handleStart} onCheckPoints={handleCheckPoints} isStudentPortal={isStudentPortal} />;
      case "checkPoints":
        return <CheckPointsScreen key="checkPoints" onBack={handleBackToStart} isStudentPortal={isStudentPortal} />;
      case "account":
        return <AccountScreen key="account" onSubmit={handleAccountSubmit} />;
      case "deposit":
        return <DepositScreen key="deposit" onDeposit={handleDeposit} userName={userData.name} />;
      case "counting":
        return <CountingScreen key="counting" onDone={handleCountingDone} userLrn={userData.lrn} userName={userData.name} userSection={userData.section} />;
      case "success":
        return <SuccessScreen key="success" onComplete={handleComplete} depositCount={depositCount} pointsEarned={depositCount} triviaBonus={triviaBonus} />;
      default:
        return <StartScreen key="start" onStart={handleStart} onCheckPoints={handleCheckPoints} isStudentPortal={isStudentPortal} />;
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
