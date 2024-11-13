import SiteLink from "../SiteLink";
import "./index.css";

interface Site {
  name: string;
  url: string;
}

interface CategoryData {
  category: string;
  sites: Site[];
}

interface CategoryProps {
  category: CategoryData;
}

function Category({ category }: CategoryProps) {
  return (
    <div className="category">
      <h2>{category.category}</h2>
      <div className="links-grid">
        {category.sites.map((site) => (
          <SiteLink key={site.name} site={site} />
        ))}
      </div>
    </div>
  );
}

export default Category;
