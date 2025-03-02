"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
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
import { cn } from "@/lib/utils";

// 预定义常用图标
const commonIcons = {
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

interface AddCategoryPopoverProps {
  onSuccess?: () => void;
}

export default function AddCategoryPopover({
  onSuccess,
}: AddCategoryPopoverProps) {
  const [open, setOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name || !selectedIcon) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Date.now().toString(),
          name,
          icon: selectedIcon,
          sites: [],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "添加分类失败");
      }

      setName("");
      setSelectedIcon("");
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加分类失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="mt-auto">
          <Plus className="h-5 w-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">分类名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入分类名称"
            />
          </div>

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
                  onClick={() => setSelectedIcon(iconName)}>
                  <IconComponent className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!name || !selectedIcon || loading}>
            {loading ? "添加中..." : "添加分类"}
          </Button>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
