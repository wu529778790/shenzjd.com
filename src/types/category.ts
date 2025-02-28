import { Site } from "./site";

export interface Category {
  id: string;
  name: string;
  icon: string;
  sites: Site[];
}
