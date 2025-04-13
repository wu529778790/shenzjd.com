import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SiteCard } from "./SiteCard";
import { AddSiteCard } from "./AddSiteCard";
import { useRequireAuth } from "@/hooks/use-require-auth";

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !isAuthenticated,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDragStart = () => {
    if (!isAuthenticated) {
      checkAuth(() => {});
    }
  };

  if (isAddCard) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onDragStart={handleDragStart}>
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
      onDragStart={handleDragStart}>
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
