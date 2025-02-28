"use client";

import { AddDialog } from "./components/addDialog";
import { ModeToggle } from "./components/modeToggle";
import { SiteCard } from "./components/SiteCard";
import { useEffect, useState } from "react";
import { Category } from "@/types/category";
import Sidebar from "./components/Sidebar";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("default");
  const [categories, setCategories] = useState<Category[]>([]);

  // 获取所有站点数据
  useEffect(() => {
    const fetchSites = async () => {
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

    fetchSites();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4">加载中...</div>;
  }

  return (
    <div className="min-h-screen">
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <main className="pl-16">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">我的导航</h1>
            <div className="flex items-center gap-2">
              <AddDialog activeCategory={activeCategory} />
              <ModeToggle />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {categories
              .find((category) => category.id === activeCategory)
              ?.sites.map((site, index) => (
                <SiteCard
                  key={index}
                  title={site.title}
                  url={site.url}
                  favicon={site.favicon}
                />
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
