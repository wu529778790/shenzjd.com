import SiteLink from "../SiteLink";
import { CategoryData } from "../types";

function Category({ category }: { category: CategoryData }) {
  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {category.sites.map((site) => (
          <SiteLink key={site.name} site={site} />
        ))}
      </div>
    </div>
  );
}

export default Category;
