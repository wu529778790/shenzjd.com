"use client";

import { Button } from "@/components/ui/button";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";
import { AddCategoryDialog } from "./AddCategoryDialog/index";
import { CategoryContextMenu } from "./CategoryContextMenu";
import { LoginButton } from "./auth/login-button";
import { ModeToggle } from "./modeToggle";
import { ForceRefresh } from "./forceRefresh";
import { GradientToggle } from "@/app/(home)/components/Sidebar/GradientToggle";

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
    const formattedName =
      iconName.charAt(0).toUpperCase() + iconName.slice(1).toLowerCase();
    return (
      (LucideIcons as unknown as Record<string, IconComponent>)[
        formattedName
      ] || LucideIcons.Folder
    );
  };

  return (
    <div className="w-16 fixed left-0 top-0 h-full flex flex-col items-center py-4 border-r border-border/40 bg-background/40 backdrop-blur-sm">
      {categories.map((category) => {
        const IconComponent = getIconComponent(category.icon);

        return (
          <CategoryContextMenu
            key={category.id}
            category={category}
            onSuccess={onCategoriesChange}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "mb-2 transition-colors duration-200 cursor-pointer",
                activeCategory === category.id
                  ? "bg-primary/10 text-primary border-primary hover:bg-primary/20"
                  : "hover:bg-accent"
              )}
              onClick={() => onSelectCategory(category.id)}>
              <IconComponent className="h-5 w-5" />
            </Button>
          </CategoryContextMenu>
        );
      })}

      <AddCategoryDialog onSuccess={onCategoriesChange}>
        <Button
          variant="ghost"
          size="icon"
          className="mb-2 cursor-pointer transition-colors duration-200 hover:bg-accent">
          <LucideIcons.Plus className="h-5 w-5" />
        </Button>
      </AddCategoryDialog>

      <div className="mt-auto space-y-2 flex flex-col items-center w-full px-2">
        <LoginButton />
        <GradientToggle />
        <ForceRefresh onRefresh={onCategoriesChange} />
        <ModeToggle />
      </div>
    </div>
  );
}
