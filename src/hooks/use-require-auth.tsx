"use client";

import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import type { JSX } from "react";

interface UseRequireAuthReturn {
  checkAuth: (callback: () => void) => void;
  LoginAlert: () => JSX.Element;
  isAuthenticated: boolean;
}

export function useRequireAuth(): UseRequireAuthReturn {
  const { data: session } = useSession();
  const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);

  const checkAuth = (callback: () => void) => {
    if (!session) {
      setIsLoginAlertOpen(true);
      return;
    }
    callback();
  };

  const LoginAlert = () => (
    <AlertDialog open={isLoginAlertOpen} onOpenChange={setIsLoginAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>需要登录</AlertDialogTitle>
          <AlertDialogDescription>
            登录后即可添加和管理您的收藏站点，数据将同步到您的 GitHub 账号
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => (window.location.href = "/api/auth/signin")}>
            去登录
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    checkAuth,
    LoginAlert,
    isAuthenticated: !!session,
  };
}
