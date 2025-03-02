"use client";

import { SiteCard } from "./components/SiteCard";
import { SearchBar } from "./components/SearchBar";
import { useEffect, useState } from "react";
import { Category } from "@/types/category";
import Sidebar from "./components/Sidebar/index";
import { FullPageScroll } from "@/components/FullPageScroll";
import { PageContextMenu } from "./components/PageContextMenu";

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onCategoriesChange={fetchCategories}
      />

      <main className="flex-1 pl-16">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pt-4 px-4">
          <SearchBar onSearch={handleSearch} />
        </div>

        <PageContextMenu
          activeCategory={activeCategory}
          onSuccess={fetchCategories}>
          <div className="h-[calc(100vh-5rem)]">
            <FullPageScroll
              onPageChange={handlePageChange}
              initialPage={getCurrentPageIndex()}>
              {categories.map((category) => (
                <div key={category.id} className="container mx-auto p-4">
                  <div className="flex flex-wrap gap-4 justify-start items-start">
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
          </div>
        </PageContextMenu>
      </main>
    </div>
  );
}
