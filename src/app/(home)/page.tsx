"use client";

import { SearchBar } from "./components/SearchBar";
import { useState } from "react";
import Sidebar from "./components/Sidebar/index";
import { FullPageScroll } from "@/components/FullPageScroll";
import { useSites } from "@/contexts/SitesContext";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortableSiteCard } from "./components/SortableSiteCard";
import { arrayMove } from "@dnd-kit/sortable";
import { MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";

export default function Home() {
  const {
    sites: categories,
    loading,
    error,
    refreshSites,
    updateSites,
  } = useSites();
  const [activeCategory, setActiveCategory] = useState<string>("default");

  // 配置传感器
  const mouseSensor = useSensor(MouseSensor, {
    // 鼠标必须按下并保持500ms才开始拖动
    activationConstraint: {
      delay: 500,
      tolerance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    // 触摸必须按下并保持500ms才开始拖动
    activationConstraint: {
      delay: 500,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  // 处理页面切换
  const handlePageChange = (pageIndex: number) => {
    if (categories[pageIndex]) {
      setActiveCategory(categories[pageIndex].id);
    }
  };

  // 获取当前分类的索引
  const getCurrentPageIndex = () => {
    return categories.findIndex((category) => category.id === activeCategory);
  };

  // 处理拖拽结束事件
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCategory = categories.find((category) =>
      category.sites.some((site) => site.id === active.id)
    );
    const overCategory = categories.find((category) =>
      category.sites.some((site) => site.id === over.id)
    );

    if (
      !activeCategory ||
      !overCategory ||
      activeCategory.id !== overCategory.id
    )
      return;

    const oldIndex = activeCategory.sites.findIndex(
      (site) => site.id === active.id
    );
    const newIndex = activeCategory.sites.findIndex(
      (site) => site.id === over.id
    );

    const newSites = arrayMove(activeCategory.sites, oldIndex, newIndex);
    const updatedCategories = categories.map((category) =>
      category.id === activeCategory.id
        ? { ...category, sites: newSites }
        : category
    );

    try {
      await updateSites(updatedCategories);
    } catch (error) {
      console.error("Failed to update sites order:", error);
      // 如果更新失败，刷新数据以恢复原始顺序
      refreshSites();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onCategoriesChange={refreshSites}
      />

      <main className="flex-1 pl-16">
        <div className="sticky top-0 z-10 backdrop-blur-sm py-24 px-4">
          <SearchBar />
        </div>

        <div className="h-[calc(100vh-5rem)]">
          <FullPageScroll
            onPageChange={handlePageChange}
            initialPage={getCurrentPageIndex()}>
            {loading
              ? [
                  // 加载状态下显示骨架屏
                  <div key="loading" className="container mx-auto p-4">
                    <div className="flex flex-wrap gap-4 justify-start items-start">
                      {[...Array(8)].map((_, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center gap-2 w-[80px] animate-pulse">
                          <div className="w-12 h-12 bg-muted rounded-xl" />
                          <div className="w-16 h-3 bg-muted rounded" />
                        </div>
                      ))}
                    </div>
                  </div>,
                ]
              : error
              ? [
                  <div key="error" className="container mx-auto p-4">
                    <div className="flex items-center justify-center h-32 text-red-500">
                      {error}
                    </div>
                  </div>,
                ]
              : categories.map((category) => (
                  <div key={category.id} className="container mx-auto p-4">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}>
                      <SortableContext
                        items={category.sites.map((site) => site.id)}
                        strategy={rectSortingStrategy}>
                        <div className="flex flex-wrap gap-4 justify-start items-start">
                          {category.sites.map((site) => (
                            <SortableSiteCard
                              key={site.id}
                              id={site.id}
                              title={site.title}
                              url={site.url}
                              favicon={site.favicon}
                              categoryId={category.id}
                              onSiteChange={refreshSites}
                            />
                          ))}
                          <SortableSiteCard
                            id={`add-${category.id}`}
                            title=""
                            url=""
                            favicon=""
                            categoryId={category.id}
                            onSiteChange={refreshSites}
                            isAddCard
                          />
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                ))}
          </FullPageScroll>
        </div>
      </main>
    </div>
  );
}
