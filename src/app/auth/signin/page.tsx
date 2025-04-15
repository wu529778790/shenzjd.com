"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useFork } from "@/hooks/useFork";
import { ForkDialog } from "@/components/ForkDialog";

export default function SignIn() {
  const { showForkDialog, setShowForkDialog, handleFork } = useFork();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            登录到您的账号
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">选择以下方式登录</p>
        </div>
        <div className="mt-8 space-y-4">
          <Button
            className="w-full"
            onClick={() => signIn("github", { callbackUrl: "/" })}>
            使用 GitHub 登录
          </Button>
          <Button
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/" })}>
            使用 Google 登录
          </Button>
        </div>
      </div>
      <ForkDialog
        open={showForkDialog}
        onOpenChange={setShowForkDialog}
        onConfirm={handleFork}
      />
    </div>
  );
}
