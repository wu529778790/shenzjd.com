"use client";

import * as React from "react";
import { Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const gradients = [
  { name: "无渐变", value: "none", style: "bg-[#f8f8f7]" },
  {
    name: "蓝紫渐变",
    value: "blue-purple",
    style: "bg-gradient-to-br from-blue-400 to-purple-500",
  },
  {
    name: "红橙渐变",
    value: "red-orange",
    style: "bg-gradient-to-br from-red-500 to-orange-400",
  },
  {
    name: "绿蓝渐变",
    value: "green-blue",
    style: "bg-gradient-to-br from-green-400 to-blue-500",
  },
  {
    name: "粉紫渐变",
    value: "pink-purple",
    style: "bg-gradient-to-br from-pink-400 to-purple-500",
  },
  {
    name: "橙黄渐变",
    value: "orange-yellow",
    style: "bg-gradient-to-br from-orange-400 to-yellow-300",
  },
];

export function GradientToggle() {
  const [gradient, setGradient] = React.useState("none");

  React.useEffect(() => {
    const savedGradient = localStorage.getItem("gradient") || "none";
    setGradient(savedGradient);
    applyGradient(savedGradient);
  }, []);

  const applyGradient = (gradientValue: string) => {
    const selectedGradient = gradients.find((g) => g.value === gradientValue);
    if (selectedGradient) {
      document.body.className = selectedGradient.style;
    }
  };

  const handleGradientChange = (gradientValue: string) => {
    setGradient(gradientValue);
    localStorage.setItem("gradient", gradientValue);
    applyGradient(gradientValue);
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="cursor-pointer">
                <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {gradients.map((g) => (
              <DropdownMenuItem
                key={g.value}
                onClick={() => handleGradientChange(g.value)}
                className={`flex items-center justify-between ${
                  gradient === g.value ? "bg-accent" : ""
                }`}>
                <span>{g.name}</span>
                <div className={`w-6 h-6 rounded ${g.style}`} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent side="right">
          <p className="text-sm">选择背景渐变色</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
