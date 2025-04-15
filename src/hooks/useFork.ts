import { useSession } from "next-auth/react";
import { useState } from "react";

export function useFork() {
  const { data: session } = useSession();
  const [showForkDialog, setShowForkDialog] = useState(false);
  const [isForked, setIsForked] = useState(false);

  const checkForkStatus = async () => {
    if (session?.user?.provider === "github") {
      try {
        const response = await fetch("/api/check-fork");
        const data = await response.json();
        setIsForked(data.isForked);
        return data.isForked;
      } catch (error) {
        console.error("Failed to check fork status:", error);
        return false;
      }
    }
    return false;
  };

  const handleFork = async () => {
    try {
      await fetch("/api/fork", {
        method: "POST",
      });
      setIsForked(true);
      setShowForkDialog(false);
      return true;
    } catch (error) {
      console.error("Failed to fork repository:", error);
      return false;
    }
  };

  return {
    showForkDialog,
    setShowForkDialog,
    handleFork,
    isForked,
    checkForkStatus,
  };
}
