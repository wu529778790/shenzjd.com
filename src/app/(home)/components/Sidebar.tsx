"use client";

import { Button } from "@/components/ui/button";
import { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { icons } from "lucide-react";
import AddCategoryDialog from "./AddCategoryDialog";

interface SidebarProps {
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function Sidebar({
  categories,
  activeCategory,
  onSelectCategory,
}: SidebarProps) {
  return (
    <div className="w-16 bg-card fixed left-0 top-0 h-full flex flex-col items-center py-4 border-r">
      {categories.map((category) => {
        const IconComponent = icons[category.icon as keyof typeof icons];
        return (
          <Button
            key={category.id}
            variant="ghost"
            size="icon"
            className={cn(
              "mb-2",
              activeCategory === category.id && "bg-accent"
            )}
            onClick={() => onSelectCategory(category.id)}>
            {IconComponent && <IconComponent className="h-5 w-5" />}
          </Button>
        );
      })}

      <AddCategoryDialog />
    </div>
  );
}
