import { useState, useEffect } from "react";
import type { Site, SiteCategory } from "@/lib/sites";

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

export function useSites(): UseSitesReturn {
  const [sites, setSites] = useState<SiteCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/sites");
      if (!response.ok) {
        throw new Error("Failed to fetch sites");
      }
      const data = await response.json();
      setSites(data);
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
      setError(null);
      const response = await fetch("/api/sites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform operation");
      }

      const result = await response.json();
      setSites(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
    refreshSites: fetchSites,
  };
}
