import { useState } from "react";
import axios from "axios";
import data from "@/data/navigation.json";
import "./index.css";

function AddNavigation() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [favicon, setFavicon] = useState("");

  const fetchSiteData = async () => {
    try {
      const response = await axios.get(`/urlMetaApi/meta?url=${url}`, {
        headers: {
          Authorization: `Basic ${import.meta.env.VITE_META_API_KEY}`,
        },
      });
      const { title, description, image } = response.data.meta;
      setTitle(title);
      setDescription(description);
      setFavicon(image);
    } catch (error) {
      console.error("Error fetching site data:", error);
    }
  };

  const handleSubmit = () => {
    const newSite = {
      name: title,
      url,
      description,
      favicon,
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
        {favicon && (
          <img src={favicon} alt="Site Favicon" className="favicon" />
        )}
      </div>
      <button onClick={handleSubmit} className="button">
        Save
      </button>
    </div>
  );
}

export default AddNavigation;
