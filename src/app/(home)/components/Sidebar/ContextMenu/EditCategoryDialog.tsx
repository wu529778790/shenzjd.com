import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconPicker } from "../components/IconPicker";
import { Category } from "@/types";

interface EditDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
  onSuccess,
}: EditDialogProps) {
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          icon: selectedIcon,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "更新分类失败");
      }

      setName("");
      setSelectedIcon("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新分类失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

          <IconPicker selectedIcon={selectedIcon} onSelect={setSelectedIcon} />

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
  );
}
