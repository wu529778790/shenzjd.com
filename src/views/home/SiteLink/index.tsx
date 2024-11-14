import "./index.css";
import { Site } from "../types";

function SiteLink({ site }: { site: Site }) {
  return (
    <a href={site.url} target="_blank" className="nav-link">
      {site.name}
    </a>
  );
}

export default SiteLink;
