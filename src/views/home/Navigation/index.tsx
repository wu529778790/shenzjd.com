import "./index.css";
import Category from "../Category";

interface Site {
  name: string;
  url: string;
}

interface CategoryData {
  category: string;
  sites: Site[];
}

interface NavigationProps {
  data: CategoryData[];
}

function Navigation({ data }: NavigationProps) {
  return (
    <div className="nav-container">
      {data?.map((cat) => (
        <Category key={cat.category} category={cat} />
      ))}
    </div>
  );
}

export default Navigation;
