import PropTypes from "prop-types";
import "./index.css";

function SiteLink({ site }) {
  return (
    <a href={site.url} target="_blank" className="nav-link">
      {site.name}
    </a>
  );
}

SiteLink.propTypes = {
  site: PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default SiteLink;
