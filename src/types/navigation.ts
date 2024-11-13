export interface Site {
  name: string;
  url: string;
  description?: string;
  image?: string;
}

export interface CategoryData {
  category: string;
  sites: Site[];
}
