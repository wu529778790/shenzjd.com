"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ForceRefresh() {
  const handleRefresh = () => {
    // 清除localStorage
    localStorage.clear();
    // 刷新页面
    window.location.reload();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            aria-label="强制刷新">
            <RefreshCw className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>强制刷新数据</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
