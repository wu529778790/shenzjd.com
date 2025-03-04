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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as LucideIcons from "lucide-react";

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
          <Button variant="ghost" size="icon" onClick={() => signIn("github")}>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="text-xs">登录</AvatarFallback>
            </Avatar>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="text-sm">登录后即可将您的数据同步到您自己的 GitHub</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
