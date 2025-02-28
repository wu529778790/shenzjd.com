"use client";

import { AddDialog } from "./components/addDialog";
import { ModeToggle } from "./components/modeToggle";
import { SiteCard } from "./components/SiteCard";
import { useEffect, useState } from "react";
import { Site } from "@/types/site";
import { Category } from "@/types/category";
import Sidebar from "./components/Sidebar";

export default function Home() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories] = useState<Category[]>([]);

  // 获取所有站点数据
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch("/api/sites");
        if (!response.ok) throw new Error("获取数据失败");
        const data = await response.json();
        setSites(data);
      } catch (error) {
        console.error("获取站点数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  const handleAddSuccess = async (newSite: Site) => {
    try {
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newSite,
        }),
      });

      if (!response.ok) throw new Error("保存失败");
      setSites((prevSites) => [...prevSites, newSite]);
    } catch (error) {
      console.error("保存站点数据失败:", error);
    }
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
      />

      <main className="pl-16">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">我的导航</h1>
            <div className="flex items-center gap-2">
              <AddDialog onAddSuccess={handleAddSuccess} />
              <ModeToggle />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {sites.map((site, index) => (
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
