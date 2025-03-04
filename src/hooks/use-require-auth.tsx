"use client";

import { useSession } from "next-auth/react";
import { useAuth } from "@/components/providers/auth-provider";

interface UseRequireAuthReturn {
  checkAuth: (callback: () => void) => void;
  isAuthenticated: boolean;
}

export function useRequireAuth(): UseRequireAuthReturn {
  const { data: session } = useSession();
  const { showLoginAlert } = useAuth();

  const checkAuth = (callback: () => void) => {
    if (!session) {
      showLoginAlert();
      return;
    }
    callback();
  };

  return {
    checkAuth,
    isAuthenticated: !!session,
  };
}
