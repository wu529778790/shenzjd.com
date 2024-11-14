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
    <>
      <Navigation data={data} />
      <AddNavigationModal />
    </>
  );
}

export default Home;
