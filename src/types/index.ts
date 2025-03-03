export interface Site {
  title: string;
  favicon: string;
  url: string;
  id: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sites: Site[];
}

export type CategoryCreate = Omit<Category, "id" | "sites">;
export type CategoryUpdate = Partial<CategoryCreate>;

export type SiteCreate = Omit<Site, "id">;
export type SiteUpdate = Partial<SiteCreate>;
