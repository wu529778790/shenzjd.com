"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function AddCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    // TODO: 实现添加分类的API调用
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="mt-auto">
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加新分类</DialogTitle>
          <DialogDescription>添加一个新分类</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">分类名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入分类名称"
            />
          </div>

          <div>
            <label className="text-sm font-medium">选择图标</label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {Object.entries(commonIcons).map(([iconName, IconComponent]) => (
                <Button
                  key={iconName}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "p-2",
                    selectedIcon === iconName && "bg-accent"
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
            disabled={!name || !selectedIcon}>
            添加分类
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
