import "./index.css";
import Category from "../Category";
import { CategoryData } from "../types";

function Navigation({ data }: { data: CategoryData[] }) {
  return (
    <div className="nav-container">
      {data?.map((cat) => (
        <Category key={cat.category} category={cat} />
      ))}
    </div>
  );
}

export default Navigation;
