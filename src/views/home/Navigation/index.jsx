import "./index.css";

function Navigation({ data }) {
  return (
    <div className="nav-container">
      {data?.map((category) => (
        <div key={category.category} className="category">
          <h2>{category.category}</h2>
          <div className="links-grid">
            {category.sites.map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                className="nav-link">
                {site.name}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Navigation;
