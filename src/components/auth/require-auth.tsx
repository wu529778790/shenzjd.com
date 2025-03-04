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

interface RequireAuthProps {
  onAuth: () => void;
  children: React.ReactNode;
}

export function RequireAuth({ onAuth, children }: RequireAuthProps) {
  const { data: session } = useSession();
  const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);

  const handleClick = () => {
    if (!session) {
      setIsLoginAlertOpen(true);
      return;
    }
    onAuth();
  };

  return (
    <>
      <div onClick={handleClick}>{children}</div>

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
    </>
  );
}
