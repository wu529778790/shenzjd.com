"use client";

import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Trash2, Pencil } from "lucide-react";
import { Category } from "@/types";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { EditCategoryDialog } from "./EditCategoryDialog";

interface EditCategoryDialogProps {
  category: Category;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export function RightButton({
  category,
  onSuccess,
  children,
}: EditCategoryDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

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

      <EditCategoryDialog
        category={category}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={onSuccess}
      />

      <DeleteCategoryDialog
        categoryId={category.id}
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}
