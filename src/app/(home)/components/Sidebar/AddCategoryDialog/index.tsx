"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { IconPicker } from "../components/IconPicker";

interface AddCategoryDialogProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function AddCategoryDialog({
  onSuccess,
  children,
}: AddCategoryDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "添加分类失败");
      }

      setName("");
      setSelectedIcon("");
      setIsDialogOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加分类失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <div onClick={() => setIsDialogOpen(true)}>{children}</div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="mt-auto"
          onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-5 w-5" />
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加分类</DialogTitle>
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
              {loading ? "添加中..." : "添加分类"}
            </Button>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
