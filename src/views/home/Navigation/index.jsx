import "./index.css";
import PropTypes from "prop-types";
import Category from "../Category";

function Navigation({ data }) {
  return (
    <div className="nav-container">
      {data?.map((cat) => (
        <Category key={cat.category} category={cat} />
      ))}
    </div>
  );
}

Navigation.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      sites: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          url: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};

export default Navigation;
