import axios from "axios";

export const fetchSiteDataApi = async (url) => {
  try {
    const response = await axios.get(`/urlMetaApi/meta?url=${url}`, {
      headers: {
        Authorization: `Basic ${import.meta.env.VITE_META_API_KEY}`,
      },
    });
    return response.data.meta;
  } catch (error) {
    console.error("Error fetching site data:", error);
    throw error;
  }
};
