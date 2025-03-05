"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState, useCallback } from "react";
import { z } from "zod";
import Image from "next/image";
import { Site } from "@/types";
import { useSites } from "@/hooks/useSites";

// URL schema 验证
const urlSchema = z.string().url("请输入有效的URL");

interface AddDialogProps {
  activeCategory: string;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddSiteDialog({
  activeCategory,
  onSuccess,
  open,
  onOpenChange,
}: AddDialogProps) {
  const { addSite } = useSites();
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [siteInfo, setSiteInfo] = useState<Site | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  const handleParse = useCallback(
    async (urlToCheck?: string) => {
      try {
        const urlToValidate = urlToCheck || link;
        urlSchema.parse(urlToValidate);
        setLoading(true);
        setError("");

        const response = await fetch("/api/parse-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: urlToValidate }),
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
    },
    [link]
  );

  useEffect(() => {
    if (!open) return;

    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        try {
          urlSchema.parse(text);
          setLink(text);
          handleParse(text);
        } catch {
          console.log("剪贴板内容不是有效URL");
        }
      } catch (err) {
        console.log("无法访问剪贴板:", err);
      }
    };

    checkClipboard();
  }, [open, handleParse]);

  const handleConfirm = async () => {
    if (!siteInfo) return;

    try {
      await addSite(activeCategory, {
        id: Date.now().toString(),
        title: editedTitle || siteInfo.title,
        favicon: siteInfo.favicon,
        url: siteInfo.url,
      });

      // 重置状态
      setLink("");
      setSiteInfo(null);
      setEditedTitle("");
      onOpenChange?.(false);

      // 调用成功回调函数
      onSuccess?.();
    } catch (error) {
      console.error("添加站点失败:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button onClick={() => handleParse()} disabled={loading}>
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
                      unoptimized
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
