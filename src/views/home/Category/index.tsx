import SiteLink from "../SiteLink";
import "./index.css";
import { CategoryData } from "../types";

function Category({ category }: { category: CategoryData }) {
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
