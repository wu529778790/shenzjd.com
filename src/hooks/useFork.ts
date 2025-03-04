import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export function useFork() {
  const { data: session, status } = useSession();
  const hasAttemptedFork = useRef(false);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user &&
      !hasAttemptedFork.current
    ) {
      hasAttemptedFork.current = true;
      // 用户登录成功后，尝试 fork 仓库
      fetch("/api/fork", {
        method: "POST",
      }).catch((error) => {
        console.error("Failed to fork repository:", error);
        // 如果失败，重置状态以便重试
        hasAttemptedFork.current = false;
      });
    }
  }, [session, status]);
}
