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
  onCategoriesChange?: () => void;
}

type IconComponent = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

export default function Sidebar({
  categories,
  activeCategory,
  onSelectCategory,
  onCategoriesChange,
}: SidebarProps) {
  const getIconComponent = (iconName: string): IconComponent => {
    // 将图标名称转换为 Pascal Case（首字母大写）
    const formattedName =
      iconName.charAt(0).toUpperCase() + iconName.slice(1).toLowerCase();
    // 获取图标组件，如果不存在则使用 Folder 图标
    return (
      (LucideIcons as unknown as Record<string, IconComponent>)[
        formattedName
      ] || LucideIcons.Folder
    );
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
              "mb-2 transition-colors duration-200",
              activeCategory === category.id
                ? "bg-primary/10 text-primary border-primary hover:bg-primary/20"
                : "hover:bg-accent"
            )}
            onClick={() => onSelectCategory(category.id)}>
            <IconComponent className="h-5 w-5" />
          </Button>
        );
      })}

      <AddCategoryDialog onSuccess={onCategoriesChange} />
    </div>
  );
}
