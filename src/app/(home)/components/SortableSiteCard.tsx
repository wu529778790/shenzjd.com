import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SiteCard } from "./SiteCard";
import { AddSiteCard } from "./AddSiteCard";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useState, useRef } from "react";

interface SortableSiteCardProps {
  id: string;
  title: string;
  url: string;
  favicon: string;
  categoryId: string;
  onSiteChange: () => void;
  isAddCard?: boolean;
}

export const SortableSiteCard = ({
  id,
  title,
  url,
  favicon,
  categoryId,
  onSiteChange,
  isAddCard = false,
}: SortableSiteCardProps) => {
  const { checkAuth, isAuthenticated } = useRequireAuth();
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const LONG_PRESS_DELAY = 500; // 500ms长按延迟

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !isAuthenticated || !isDragEnabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragEnabled ? "grab" : "pointer",
  };

  const handlePointerDown = () => {
    if (!isAuthenticated) {
      checkAuth(() => setIsDragEnabled(true));
      return;
    }

    // 开始长按计时
    longPressTimeoutRef.current = setTimeout(() => {
      setIsDragEnabled(true);
    }, LONG_PRESS_DELAY);
  };

  const handlePointerUp = () => {
    // 清除长按计时器
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  const handlePointerLeave = () => {
    // 清除长按计时器
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
    setIsDragEnabled(false);
  };

  const handleDragEnd = () => {
    setIsDragEnabled(false);
  };

  if (isAddCard) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onDragEnd={handleDragEnd}>
        <AddSiteCard activeCategory={categoryId} onSuccess={onSiteChange} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onDragEnd={handleDragEnd}>
      <SiteCard
        id={id}
        title={title}
        url={url}
        favicon={favicon}
        categoryId={categoryId}
        onSiteChange={onSiteChange}
      />
    </div>
  );
};
