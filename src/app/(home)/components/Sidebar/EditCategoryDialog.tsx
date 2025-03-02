"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Trash2,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/types/category";

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

interface EditCategoryDialogProps {
  category: Category;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export default function EditCategoryDialog({
  category,
  onSuccess,
  children,
}: EditCategoryDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(category.icon);
  const [name, setName] = useState(category.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name || !selectedIcon) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          icon: selectedIcon,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "更新分类失败");
      }

      setIsDialogOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新分类失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除这个分类吗？此操作不可撤销。")) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除分类失败");
      }

      setIsDialogOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除分类失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => setIsDialogOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          编辑分类
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={handleDelete}
          className="text-red-600 focus:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          删除分类
        </ContextMenuItem>
      </ContextMenuContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
          </DialogHeader>
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
                {Object.entries(commonIcons).map(
                  ([iconName, IconComponent]) => (
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
                  )
                )}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!name || !selectedIcon || loading}>
              {loading ? "更新中..." : "更新分类"}
            </Button>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </ContextMenu>
  );
}
