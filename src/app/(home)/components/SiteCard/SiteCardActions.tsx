import { Edit2Icon, Trash2Icon } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface SiteCardActionsProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}

export function SiteCardActions({
  children,
  onEdit,
  onDelete,
}: SiteCardActionsProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={onEdit}
          className="flex items-center gap-2 cursor-pointer">
          <Edit2Icon className="w-4 h-4" />
          <span>编辑</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={onDelete}
          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600">
          <Trash2Icon className="w-4 h-4" />
          <span>删除</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
