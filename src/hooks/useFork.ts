import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export function useFork() {
  const { data: session, status } = useSession();
  const [showForkDialog, setShowForkDialog] = useState(false);
  const hasAttemptedFork = useRef(false);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.provider === "github" &&
      !hasAttemptedFork.current
    ) {
      setShowForkDialog(true);
    }
  }, [session, status]);

  const handleFork = async () => {
    try {
      hasAttemptedFork.current = true;
      await fetch("/api/fork", {
        method: "POST",
      });
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
  };
}
