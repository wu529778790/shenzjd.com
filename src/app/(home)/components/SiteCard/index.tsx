import Image from "next/image";
import { useState, useCallback } from "react";
import { SiteCardActions } from "./SiteCardActions";
import { EditSiteDialog } from "./EditSiteDialog";

interface SiteCardProps {
  title: string;
  url: string;
  favicon?: string;
  categoryId: string;
  onSiteChange?: () => void;
}

export function SiteCard({
  title: initialTitle,
  url,
  favicon,
  categoryId,
  onSiteChange,
}: SiteCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(initialTitle);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/categories/${categoryId}/sites`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldUrl: url,
          site: {
            title: editedTitle,
            url,
            favicon,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("更新站点失败");
      }

      setIsEditDialogOpen(false);
      onSiteChange?.();
    } catch (error) {
      console.error("更新站点失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/categories/${categoryId}/sites`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
        }),
      });

      if (!response.ok) {
        throw new Error("删除站点失败");
      }

      onSiteChange?.();
    } catch (error) {
      console.error("删除站点失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      // 如果是右键点击，不执行任何操作
      if (e.button === 2) {
        return;
      }
      // 在新标签页中打开链接
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [url]
  );

  return (
    <>
      <SiteCardActions
        onEdit={() => setIsEditDialogOpen(true)}
        onDelete={handleDelete}>
        <div
          onClick={handleCardClick}
          className="flex flex-col items-center gap-2 cursor-pointer group w-[80px]">
          <div className="w-12 h-12 relative flex items-center justify-center rounded-xl overflow-hidden bg-white shadow-sm group-hover:shadow-md transition-all duration-200">
            {favicon ? (
              <Image
                src={favicon}
                alt={initialTitle}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>
          <span className="text-xs text-center text-gray-600 truncate w-full">
            {initialTitle}
          </span>
        </div>
      </SiteCardActions>

      <EditSiteDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title={editedTitle}
        favicon={favicon}
        onTitleChange={setEditedTitle}
        onSave={handleEdit}
        isLoading={isLoading}
      />
    </>
  );
}
