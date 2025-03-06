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
import { cn } from "@/lib/utils";
import { useSites } from "@/contexts/SitesContext";

interface ForceRefreshProps {
  onRefresh?: () => void;
}

export function ForceRefresh({ onRefresh }: ForceRefreshProps) {
  const { refreshSites } = useSites();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // 清除localStorage
      localStorage.clear();
      // 强制刷新数据
      await refreshSites();
      // 调用父组件的刷新回调
      onRefresh?.();
    } finally {
      // 短暂延迟后重置状态，让用户看到加载动画
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="强制刷新">
            <RefreshCw
              className={cn(
                "h-[1.2rem] w-[1.2rem]",
                isRefreshing && "animate-spin"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>强制刷新数据</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
