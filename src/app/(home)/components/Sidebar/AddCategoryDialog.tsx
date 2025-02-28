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

interface AddCategoryDialogProps {
  onSuccess?: () => void;
}

export default function AddCategoryDialog({
  onSuccess,
}: AddCategoryDialogProps) {
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
          id: Date.now().toString(), // 使用时间戳作为临时ID
          name,
          icon: selectedIcon,
          sites: [],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "添加分类失败");
      }

      // 重置表单
      setName("");
      setSelectedIcon("");
      setOpen(false);

      // 调用成功回调来更新UI
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加分类失败");
    } finally {
      setLoading(false);
    }
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
            disabled={!name || !selectedIcon || loading}>
            {loading ? "添加中..." : "添加分类"}
          </Button>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
