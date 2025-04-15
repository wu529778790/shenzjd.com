"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import { useFork } from "@/hooks/useFork";
import { ForkDialog } from "@/components/ForkDialog";

interface ForkContextType {
  checkAndShowForkDialog: (onSuccess?: () => void) => Promise<boolean>;
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
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(
    null
  );

  const handleForkWithCallback = async () => {
    const success = await handleFork();
    if (success && pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  const checkAndShowForkDialog = async (onSuccess?: () => void) => {
    const isAlreadyForked = await checkForkStatus();
    if (!isAlreadyForked) {
      if (onSuccess) {
        setPendingCallback(() => onSuccess);
      }
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
        onConfirm={handleForkWithCallback}
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
