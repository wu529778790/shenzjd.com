import { useEffect, useState } from "react";
import Navigation from "./Navigation";
import AddNavigationModal from "./Add";
import { CategoryData } from "./types";

const fetchNavigationData = async (): Promise<CategoryData[]> => {
  const response = await fetch("/navigation.json");
  if (!response.ok) {
    throw new Error("Error fetching navigation data");
  }
  return response.json();
};

function Home() {
  const [data, setData] = useState<CategoryData[]>([]);

  useEffect(() => {
    fetchNavigationData()
      .then((data) => setData(data))
      .catch((error) =>
        console.error("Error fetching navigation data:", error)
      );
  }, []);

  return (
    <div className="p-4 flex flex-col">
      <AddNavigationModal />
      <div className="max-w-screen-lg mx-auto">
        <Navigation data={data} />
      </div>
    </div>
  );
}

export default Home;
