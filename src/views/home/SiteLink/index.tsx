import "./index.css";

interface Site {
  name: string;
  url: string;
}

interface SiteLinkProps {
  site: Site;
}

function SiteLink({ site }: SiteLinkProps) {
  return (
    <a href={site.url} target="_blank" className="nav-link">
      {site.name}
    </a>
  );
}

export default SiteLink;
