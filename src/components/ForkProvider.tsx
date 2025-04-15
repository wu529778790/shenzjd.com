"use client";

import { createContext, useContext, ReactNode } from "react";
import { useFork } from "@/hooks/useFork";
import { ForkDialog } from "@/components/ForkDialog";

interface ForkContextType {
  checkAndShowForkDialog: () => Promise<boolean>;
  isForked: boolean;
}

const ForkContext = createContext<ForkContextType | null>(null);

export function ForkProvider({ children }: { children: ReactNode }) {
  const {
    showForkDialog,
    setShowForkDialog,
    handleFork,
    isForked,
    checkForkStatus,
  } = useFork();

  const checkAndShowForkDialog = async () => {
    const isAlreadyForked = await checkForkStatus();
    if (!isAlreadyForked) {
      setShowForkDialog(true);
      return false;
    }
    return true;
  };

  return (
    <ForkContext.Provider value={{ checkAndShowForkDialog, isForked }}>
      {children}
      <ForkDialog
        open={showForkDialog}
        onOpenChange={setShowForkDialog}
        onConfirm={handleFork}
      />
    </ForkContext.Provider>
  );
}

export function useForkContext() {
  const context = useContext(ForkContext);
  if (!context) {
    throw new Error("useForkContext must be used within a ForkProvider");
  }
  return context;
}
