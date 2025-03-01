import Image from "next/image";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={(e) => e.preventDefault()}>
            <div className="relative w-12 h-12 mb-2">
              {favicon ? (
                <Image
                  src={favicon}
                  alt={initialTitle}
                  fill
                  sizes="48px"
                  unoptimized
                  className="object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg" />
              )}
            </div>
            <span className="text-sm text-center text-gray-700 line-clamp-1">
              {initialTitle}
            </span>
          </a>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={() => setIsEditDialogOpen(true)}
            className="flex items-center gap-2 cursor-pointer">
            <Edit2Icon className="w-4 h-4" />
            <span>编辑</span>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleDelete}
            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600">
            <Trash2Icon className="w-4 h-4" />
            <span>删除</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑站点</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              {favicon && (
                <div className="relative w-6 h-6 flex-shrink-0">
                  <Image
                    src={favicon}
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

            <Button
              onClick={handleEdit}
              className="w-full"
              disabled={isLoading}>
              {isLoading ? "保存中..." : "保存"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
