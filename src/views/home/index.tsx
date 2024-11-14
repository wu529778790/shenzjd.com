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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchNavigationData()
      .then((data) => setData(data))
      .catch((error) =>
        console.error("Error fetching navigation data:", error)
      );
  }, []);

  const handleAddButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button onClick={handleAddButtonClick} className="button">
        Add Navigation
      </button>
      <Navigation data={data} />
      <AddNavigationModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}

export default Home;
