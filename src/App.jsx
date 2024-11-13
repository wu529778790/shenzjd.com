import "./App.css";

export default App;
import { useState } from "react";
import data from "./data/navigation.json";

function App() {
  const [navData] = useState(data);
  return (
    <div className="nav-container">
      {navData?.map((category) => (
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
