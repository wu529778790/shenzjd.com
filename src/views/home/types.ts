export interface Site {
  name: string;
  url: string;
  image: string;
  description: string;
}

export interface CategoryData {
  category: string;
  sites: Site[];
}
