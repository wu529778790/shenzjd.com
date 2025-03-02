"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  Globe,
  Folder,
  Briefcase,
  Heart,
  Star,
  BookOpen,
  Coffee,
  Music,
  Film,
  Camera,
  ShoppingBag,
  Gamepad2,
  Car,
  Plane,
  Rocket,
  Code,
  Database,
  Monitor,
  Smartphone,
  Laptop,
  Cloud,
  Settings,
} from "lucide-react";

// 预定义常用图标
export const commonIcons = {
  home: Home,
  globe: Globe,
  folder: Folder,
  briefcase: Briefcase,
  heart: Heart,
  star: Star,
  book: BookOpen,
  coffee: Coffee,
  music: Music,
  film: Film,
  camera: Camera,
  shopping: ShoppingBag,
  game: Gamepad2,
  car: Car,
  plane: Plane,
  rocket: Rocket,
  code: Code,
  database: Database,
  monitor: Monitor,
  smartphone: Smartphone,
  laptop: Laptop,
  cloud: Cloud,
  settings: Settings,
};

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
}

export function IconPicker({ selectedIcon, onSelect }: IconPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">选择图标</label>
      <div className="grid grid-cols-6 gap-2">
        {Object.entries(commonIcons).map(([iconName, IconComponent]) => (
          <Button
            key={iconName}
            variant="ghost"
            size="icon"
            className={cn(
              "p-2 hover:bg-transparent",
              selectedIcon === iconName
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                : "hover:bg-transparent"
            )}
            onClick={() => onSelect(iconName)}>
            <IconComponent className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  );
}
