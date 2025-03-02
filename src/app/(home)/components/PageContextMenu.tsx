import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { AddDialog } from "./addDialog";
import { useState } from "react";

interface PageContextMenuProps {
  activeCategory: string;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function PageContextMenu({
  activeCategory,
  onSuccess,
  children,
}: PageContextMenuProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="flex-1">{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setIsAddDialogOpen(true)}>
            添加网站
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        activeCategory={activeCategory}
        onSuccess={onSuccess}
      />
    </>
  );
}
