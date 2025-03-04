"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="flex flex-col items-start">
            <span className="font-medium">{session.user?.name}</span>
            <span className="text-xs text-muted-foreground">
              {session.user?.email}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut()}>
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={() => signIn("github")}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">登录</AvatarFallback>
      </Avatar>
    </Button>
  );
}
