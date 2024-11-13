import { useState } from "react";
import data from "@/data/navigation.json";
import "./index.css";
import { fetchSiteDataApi } from "./api";

function AddNavigation() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const fetchSiteData = async () => {
    try {
      const { title, description, image } = await fetchSiteDataApi(url);
      setTitle(title);
      setDescription(description);
      setImage(image);
    } catch (error) {
      console.error("Error fetching site data:", error);
    }
  };

  const handleSubmit = () => {
    const newSite = {
      name: title,
      url,
      description,
      image,
    };
    data.push(newSite);
    // Save the updated data to the JSON file or state management
    console.log("New site added:", newSite);
  };

  return (
    <div className="container">
      <h1 className="title">Add Navigation</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
        className="input-text"
      />
      <button onClick={fetchSiteData} className="button">
        Fetch Site Data
      </button>
      <div className="site-data">
        <h2 className="subtitle">Title: {title}</h2>
        <p className="description">Description: {description}</p>
        {image && <img src={image} alt="Site Favicon" className="image" />}
      </div>
      <button onClick={handleSubmit} className="button">
        Save
      </button>
    </div>
  );
}

export default AddNavigation;
