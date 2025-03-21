import Image from "next/image";
import { useState, useEffect } from "react";
import { EditSiteDialog } from "./EditSiteDialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSites } from "@/contexts/SitesContext";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Pencil, Trash2 } from "lucide-react";

interface SiteCardProps {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  categoryId: string;
  onSiteChange?: () => void;
}

export function SiteCard({
  id,
  title: initialTitle,
  url,
  favicon = "",
  categoryId,
  onSiteChange,
}: SiteCardProps) {
  const { updateSite, deleteSite } = useSites();
  const { checkAuth } = useRequireAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(initialTitle);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEditedTitle(initialTitle);
  }, [initialTitle]);

  const handleEdit = async () => {
    try {
      setIsLoading(true);
      await updateSite(categoryId, id, {
        id,
        title: editedTitle,
        url,
        favicon,
      });
      setIsEditDialogOpen(false);
      onSiteChange?.();
    } catch (error) {
      console.error("Failed to update site:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteSite(categoryId, id);
      setIsDeleteAlertOpen(false);
      onSiteChange?.();
    } catch (error) {
      console.error("Failed to delete site:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    window.open(url, "_blank");
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            key={id}
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
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={() => checkAuth(() => setIsEditDialogOpen(true))}>
            <Pencil className="mr-2 h-4 w-4" />
            编辑
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => checkAuth(() => setIsDeleteAlertOpen(true))}
            className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <EditSiteDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title={editedTitle}
        favicon={favicon}
        onTitleChange={setEditedTitle}
        onSave={handleEdit}
        isLoading={isLoading}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 &ldquo;{initialTitle}&rdquo; 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "删除中..." : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
