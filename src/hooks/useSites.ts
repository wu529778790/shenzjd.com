import { useState, useEffect } from "react";
import type { Site, SiteCategory } from "@/lib/sites";
import { useSession } from "next-auth/react";

interface UseSitesReturn {
  sites: SiteCategory[];
  loading: boolean;
  error: string | null;
  addSite: (categoryId: string, site: Site) => Promise<void>;
  updateSite: (categoryId: string, siteId: string, site: Site) => Promise<void>;
  deleteSite: (categoryId: string, siteId: string) => Promise<void>;
  addCategory: (category: SiteCategory) => Promise<void>;
  updateCategory: (categoryId: string, category: SiteCategory) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  refreshSites: () => Promise<void>;
}

type RequestData = {
  categoryId?: string;
  siteId?: string;
  site?: Site;
  category?: SiteCategory;
};

const CACHE_KEY = "sites_cache";
const CACHE_EXPIRY_KEY = "sites_cache_expiry";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时

function getCachedSites(): SiteCategory[] | null {
  try {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    if (!expiry) return null;

    const now = Date.now();
    if (now > parseInt(expiry)) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
      return null;
    }

    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
}

function setCachedSites(sites: SiteCategory[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(sites));
    localStorage.setItem(
      CACHE_EXPIRY_KEY,
      (Date.now() + CACHE_DURATION).toString()
    );
  } catch (error) {
    console.error("Error setting cache:", error);
  }
}

export function useSites(): UseSitesReturn {
  const [sites, setSites] = useState<SiteCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchSites = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // 如果不是强制刷新，先尝试从缓存获取
      if (!forceRefresh) {
        const cached = getCachedSites();
        if (cached) {
          setSites(cached);
          setLoading(false);
          return;
        }
      }

      // 从服务器获取数据
      const response = await fetch("/api/sites");
      if (!response.ok) {
        throw new Error("Failed to fetch sites");
      }
      const data = await response.json();
      setSites(data);
      setCachedSites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const makeRequest = async (
    method: string,
    type: string,
    data: RequestData
  ) => {
    try {
      // 检查是否已登录
      if (!session) {
        throw new Error("请先登录后再进行操作");
      }

      setError(null);
      const response = await fetch("/api/sites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          data: type === "addCategory" ? data.category : data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "操作失败");
      }

      const result = await response.json();
      setSites(result);
      setCachedSites(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "操作失败";
      setError(errorMessage);
      throw err;
    }
  };

  const addSite = async (categoryId: string, site: Site) => {
    await makeRequest("POST", "addSite", { categoryId, site });
  };

  const updateSite = async (categoryId: string, siteId: string, site: Site) => {
    await makeRequest("PUT", "updateSite", { categoryId, siteId, site });
  };

  const deleteSite = async (categoryId: string, siteId: string) => {
    await makeRequest("DELETE", "deleteSite", { categoryId, siteId });
  };

  const addCategory = async (category: SiteCategory) => {
    await makeRequest("POST", "addCategory", { category });
  };

  const updateCategory = async (categoryId: string, category: SiteCategory) => {
    await makeRequest("PUT", "updateCategory", { categoryId, category });
  };

  const deleteCategory = async (categoryId: string) => {
    await makeRequest("DELETE", "deleteCategory", { categoryId });
  };

  return {
    sites,
    loading,
    error,
    addSite,
    updateSite,
    deleteSite,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshSites: () => fetchSites(true), // 强制刷新
  };
}
