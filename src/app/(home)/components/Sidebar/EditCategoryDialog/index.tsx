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
import { Trash2, Pencil } from "lucide-react";
import { Category } from "@/types/category";
import { IconPicker } from "../components/IconPicker";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";

interface EditCategoryDialogProps {
  category: Category;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export function EditCategoryDialog({
  category,
  onSuccess,
  children,
}: EditCategoryDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
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

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setIsDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            编辑分类
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() => setIsDeleteAlertOpen(true)}
            className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            删除分类
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

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

            <IconPicker
              selectedIcon={selectedIcon}
              onSelect={setSelectedIcon}
            />

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

      <DeleteCategoryDialog
        categoryId={category.id}
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}
