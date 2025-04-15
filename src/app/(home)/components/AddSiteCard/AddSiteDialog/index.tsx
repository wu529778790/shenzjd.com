"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState, useCallback, useRef } from "react";
import { z } from "zod";
import { Site } from "@/types";
import { useSites } from "@/contexts/SitesContext";
import { UrlInput } from "./UrlInput";
import { SiteInfoForm } from "./SiteInfoForm";
import ReCAPTCHA from "react-google-recaptcha";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleParse = useCallback(
    async (urlToCheck?: string) => {
      try {
        const urlToValidate = urlToCheck || link;
        urlSchema.parse(urlToValidate);
        setLoading(true);
        setError("");
        setIsSubmitting(false);

        // 使用专门的API服务获取网站信息
        const urlObj = new URL(urlToValidate);
        const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
          urlToValidate
        )}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        // 解析返回的HTML内容
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, "text/html");

        // 获取标题
        const title =
          doc.querySelector("title")?.textContent ||
          doc
            .querySelector('meta[property="og:title"]')
            ?.getAttribute("content") ||
          "";

        // 使用 unavatar.io 获取 favicon
        const favicon = `https://unavatar.io/${urlObj.hostname}`;

        setSiteInfo({
          id: Date.now().toString(),
          title,
          favicon,
          url: urlToValidate,
        });
        setEditedTitle(title);
        setLoading(false);
      } catch (err) {
        // 如果发生错误，创建一个基本的siteInfo对象
        setSiteInfo({
          id: Date.now().toString(),
          title: "",
          favicon: "",
          url: link,
        });
        setEditedTitle("");
        setError(err instanceof Error ? err.message : "发生未知错误");
        setLoading(false);
        setIsSubmitting(false);
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

  // 重置reCAPTCHA
  const resetRecaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleConfirm = async () => {
    if (!siteInfo) return;

    // 检查reCAPTCHA是否已通过验证
    if (!recaptchaToken) {
      setError("请完成人机验证");
      return;
    }

    try {
      setIsSubmitting(true);

      // 验证reCAPTCHA token
      const verifyResponse = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: recaptchaToken }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResult.success) {
        setError("人机验证失败，请重试");
        resetRecaptcha();
        setIsSubmitting(false);
        return;
      }

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
      setRecaptchaToken(null);
      resetRecaptcha();
      onOpenChange?.(false);

      // 调用成功回调函数
      onSuccess?.();
    } catch (error) {
      console.error("添加站点失败:", error);
      setError("添加站点失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle>添加</DialogTitle>
          <DialogDescription>添加一个新链接</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <UrlInput
            link={link}
            onLinkChange={setLink}
            onParse={handleParse}
            loading={loading}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          {siteInfo && (
            <div className="space-y-4">
              <SiteInfoForm
                siteInfo={siteInfo}
                editedTitle={editedTitle}
                onTitleChange={setEditedTitle}
                onFaviconChange={(favicon) =>
                  setSiteInfo((prev) => (prev ? { ...prev, favicon } : null))
                }
                onSubmit={handleConfirm}
                isSubmitting={isSubmitting}
              />

              <div className="relative z-50 flex justify-center">
                <div className="absolute left-1/2 -translate-x-1/2 transform">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                    onChange={(token) => setRecaptchaToken(token)}
                  />
                </div>
              </div>

              {/* 添加一个占位符，确保有足够的空间显示reCAPTCHA */}
              <div className="h-[100px]" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
