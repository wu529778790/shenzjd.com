"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import Image from "next/image";
import { Site } from "@/types/site";

// URL schema 验证
const urlSchema = z.string().url("请输入有效的URL");

interface AddDialogProps {
  onAddSuccess: (newSite: Site) => void;
}

export function AddDialog({ onAddSuccess }: AddDialogProps) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [siteInfo, setSiteInfo] = useState<Site | null>(null);

  // 新增编辑状态的网站信息
  const [editedTitle, setEditedTitle] = useState("");

  const handleParse = async () => {
    try {
      urlSchema.parse(link);
      setLoading(true);
      setError("");

      const response = await fetch("/api/parse-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: link }),
      });

      if (!response.ok) {
        throw new Error("获取网站信息失败");
      }

      const data = await response.json();
      setSiteInfo(data);
      setEditedTitle(data.title);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发生未知错误");
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!siteInfo) return;

    onAddSuccess({
      ...siteInfo,
      title: editedTitle || siteInfo.title,
    });

    // 重置状态
    setLink("");
    setSiteInfo(null);
    setEditedTitle("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="w-4 h-4" />
          添加
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加</DialogTitle>
          <DialogDescription>添加一个新链接</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="请输入链接"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleParse} disabled={loading}>
              {loading ? "解析中..." : "解析"}
            </Button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {siteInfo && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                {siteInfo.favicon && (
                  <div className="relative w-6 h-6 flex-shrink-0">
                    <Image
                      src={siteInfo.favicon}
                      alt="网站图标"
                      fill
                      sizes="24px"
                      className="object-contain"
                      unoptimized // 由于 favicon 通常很小，我们可以禁用优化
                    />
                  </div>
                )}
                <Input
                  placeholder="标题"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              </div>

              <Button onClick={handleConfirm} className="w-full">
                确认添加
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
