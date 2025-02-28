"use client";

import { Button } from "@/components/ui/button";
import { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";
import AddCategoryDialog from "./AddCategoryDialog";

interface SidebarProps {
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
}

type IconComponent = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

export default function Sidebar({
  categories,
  activeCategory,
  onSelectCategory,
}: SidebarProps) {
  const getIconComponent = (iconName: string): IconComponent => {
    // 处理空值情况
    if (!iconName) return LucideIcons.Folder;

    // 直接获取图标组件
    const IconComponent = (
      LucideIcons as unknown as Record<string, IconComponent>
    )[iconName];
    return IconComponent || LucideIcons.Folder;
  };

  return (
    <div className="w-16 bg-card fixed left-0 top-0 h-full flex flex-col items-center py-4 border-r">
      {categories.map((category) => {
        const IconComponent = getIconComponent(category.icon);

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
            <IconComponent className="h-5 w-5" />
          </Button>
        );
      })}

      <AddCategoryDialog />
    </div>
  );
}
