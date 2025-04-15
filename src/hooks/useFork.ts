import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export function useFork() {
  const { data: session, status } = useSession();
  const [showForkDialog, setShowForkDialog] = useState(false);
  const [isForked, setIsForked] = useState(false);
  const hasAttemptedFork = useRef(false);

  useEffect(() => {
    const checkForkStatus = async () => {
      if (status === "authenticated" && session?.user?.provider === "github") {
        try {
          const response = await fetch("/api/check-fork");
          const data = await response.json();
          setIsForked(data.isForked);

          if (!data.isForked && !hasAttemptedFork.current) {
            setShowForkDialog(true);
          }
        } catch (error) {
          console.error("Failed to check fork status:", error);
        }
      }
    };

    checkForkStatus();
  }, [session, status]);

  const handleFork = async () => {
    try {
      hasAttemptedFork.current = true;
      await fetch("/api/fork", {
        method: "POST",
      });
      setIsForked(true);
      setShowForkDialog(false);
    } catch (error) {
      console.error("Failed to fork repository:", error);
      hasAttemptedFork.current = false;
    }
  };

  return {
    showForkDialog,
    setShowForkDialog,
    handleFork,
    isForked,
  };
}
