"use client";

import { AddDialog } from "./components/addDialog";
import { ModeToggle } from "./components/modeToggle";
import { SiteCard } from "./components/SiteCard";
import { useEffect, useState } from "react";
import { Category } from "@/types/category";
import Sidebar from "./components/Sidebar/index";
import { FullPageScroll } from "@/components/FullPageScroll";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("default");

  // 获取所有站点数据
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("获取数据失败");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("获取站点数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchCategories();
  }, []);

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

  if (loading) {
    return <div className="container mx-auto p-4">加载中...</div>;
  }

  return (
    <div className="min-h-screen">
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onCategoriesChange={fetchCategories}
      />

      <main className="pl-16">
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <AddDialog
            activeCategory={activeCategory}
            onSuccess={fetchCategories}
          />
          <ModeToggle />
        </div>

        <FullPageScroll
          onPageChange={handlePageChange}
          initialPage={getCurrentPageIndex()}>
          {categories.map((category) => (
            <div key={category.id} className="container mx-auto p-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{category.name}</h1>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {category.sites.map((site, index) => (
                  <SiteCard
                    key={index}
                    title={site.title}
                    url={site.url}
                    favicon={site.favicon}
                    categoryId={category.id}
                    onSiteChange={fetchCategories}
                  />
                ))}
              </div>
            </div>
          ))}
        </FullPageScroll>
      </main>
    </div>
  );
}
