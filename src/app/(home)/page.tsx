"use client";

import { AddDialog } from "./components/addDialog";
import { ModeToggle } from "./components/modeToggle";
import { SiteCard } from "./components/SiteCard";
import { SearchBar } from "./components/SearchBar";
import { useEffect, useState } from "react";
import { Category } from "@/types/category";
import Sidebar from "./components/Sidebar/index";
import { FullPageScroll } from "@/components/FullPageScroll";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState("");

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

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // 过滤站点
  const getFilteredSites = (category: Category) => {
    if (!searchQuery) return category.sites;
    return category.sites.filter((site) =>
      site.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

        <div className="pt-4 px-4">
          <SearchBar onSearch={handleSearch} />
        </div>

        <FullPageScroll
          onPageChange={handlePageChange}
          initialPage={getCurrentPageIndex()}>
          {categories.map((category) => (
            <div key={category.id} className="container mx-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {getFilteredSites(category).map((site, index) => (
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
