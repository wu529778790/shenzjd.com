"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Site } from "@/types";

interface SiteInfoFormProps {
  siteInfo: Site;
  editedTitle: string;
  onTitleChange: (title: string) => void;
  onFaviconChange: (favicon: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export function SiteInfoForm({
  siteInfo,
  editedTitle,
  onTitleChange,
  onFaviconChange,
  onSubmit,
  isSubmitting,
}: SiteInfoFormProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="图标URL"
            value={siteInfo.favicon || ""}
            onChange={(e) => onFaviconChange(e.target.value)}
            disabled={isSubmitting}
          />
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
        </div>
        <Input
          placeholder="标题"
          value={editedTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <Button
        onClick={onSubmit}
        className="w-full cursor-pointer"
        disabled={isSubmitting}>
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            添加中...
          </div>
        ) : (
          "确认添加"
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        请完成下方的人机验证后再点击确认添加
      </p>
    </div>
  );
}
