import Navigation from "./Navigation";
import data from "@/data/navigation.json";

function Home() {
  return (
    <>
      <Navigation data={data} />
    </>
  );
}

export default Home;
