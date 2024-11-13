import PropTypes from "prop-types";
import SiteLink from "../SiteLink";
import "./index.css";

function Category({ category }) {
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

Category.propTypes = {
  category: PropTypes.shape({
    category: PropTypes.string.isRequired,
    sites: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default Category;
