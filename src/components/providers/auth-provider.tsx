"use client";

import { SessionProvider, signIn } from "next-auth/react";
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
import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextType {
  showLoginAlert: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function AuthAlert({ children }: { children: ReactNode }) {
  const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);

  const showLoginAlert = () => {
    setIsLoginAlertOpen(true);
  };

  return (
    <AuthContext.Provider value={{ showLoginAlert }}>
      {children}
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
            <AlertDialogAction onClick={() => signIn("github")}>
              去登录
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthAlert>{children}</AuthAlert>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
