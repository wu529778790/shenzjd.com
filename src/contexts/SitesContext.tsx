import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type { Site, SiteCategory } from "@/lib/sites";
import { useSession } from "next-auth/react";
import { useForkContext } from "@/components/ForkProvider";

interface SitesContextType {
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
  updateSites: (sites: SiteCategory[]) => Promise<void>;
}

const SitesContext = createContext<SitesContextType | null>(null);

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

type RequestData = {
  categoryId?: string;
  siteId?: string;
  site?: Site;
  category?: SiteCategory;
};

export function SitesProvider({ children }: { children: ReactNode }) {
  const [sites, setSites] = useState<SiteCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const { checkAndShowForkDialog } = useForkContext();

  const fetchSites = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!forceRefresh) {
        const cached = getCachedSites();
        if (cached) {
          setSites(cached);
          setLoading(false);
          return;
        }
      }

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
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const makeRequest = async (
    method: string,
    type: string,
    data: RequestData
  ) => {
    try {
      if (!session) {
        throw new Error("请先登录后再进行操作");
      }

      const isForked = await checkAndShowForkDialog();
      if (!isForked) {
        throw new Error("需要先 Fork 仓库才能保存数据");
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

  const updateSites = async (newSites: SiteCategory[]) => {
    try {
      if (!session) {
        throw new Error("请先登录后再进行操作");
      }

      setError(null);
      const response = await fetch("/api/sites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "updateSites",
          data: newSites,
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

  return (
    <SitesContext.Provider
      value={{
        sites,
        loading,
        error,
        addSite,
        updateSite,
        deleteSite,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshSites: () => fetchSites(true),
        updateSites,
      }}>
      {children}
    </SitesContext.Provider>
  );
}

export function useSites() {
  const context = useContext(SitesContext);
  if (!context) {
    throw new Error("useSites must be used within a SitesProvider");
  }
  return context;
}
