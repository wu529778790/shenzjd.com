"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface LoginProviderProps {
  id: string;
  name: string;
  icon: string;
}

const providers: LoginProviderProps[] = [
  {
    id: "github",
    name: "Sign in with GitHub",
    icon: "https://authjs.dev/img/providers/github.svg",
  },
  {
    id: "google",
    name: "Sign in with Google",
    icon: "https://authjs.dev/img/providers/google.svg",
  },
];

function LoginDialog() {
  const [open, setOpen] = useState(false);

  const handleProviderLogin = (providerId: string) => {
    signIn(providerId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback className="text-xs">登录</AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">选择登录方式</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {providers.map((provider) => (
            <Button
              key={provider.id}
              variant="outline"
              className="w-full h-12 relative"
              onClick={() => handleProviderLogin(provider.id)}>
              <Image
                src={provider.icon}
                alt={provider.name}
                width={20}
                height={20}
                className="absolute left-4"
              />
              <span>{provider.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session.user?.image || ""}
                alt={session.user?.name || ""}
              />
              <AvatarFallback>
                {session.user?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-72">
          <div className="flex items-center gap-4 p-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={session.user?.image || ""}
                alt={session.user?.name || ""}
              />
              <AvatarFallback>
                {session.user?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-sm">
                {session.user?.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {session.user?.email}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="text-destructive focus:text-destructive focus:bg-destructive/10">
            <LucideIcons.LogOut className="mr-2 h-4 w-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <LoginDialog />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="text-sm">登录后即可将您的数据同步到您自己的 GitHub</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
