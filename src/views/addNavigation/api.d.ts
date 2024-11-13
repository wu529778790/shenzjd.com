export interface SiteData {
  title: string;
  description: string;
  image: string;
}

export declare function fetchSiteDataApi(url: string): Promise<SiteData>;
