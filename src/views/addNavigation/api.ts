import axios from "axios";

interface MetaResponse {
  meta: {
    title: string;
    description: string;
    image: string;
  };
}

export const fetchSiteDataApi = async (
  url: string
): Promise<{
  title: string;
  description: string;
  image: string;
}> => {
  try {
    const response = await axios.get<MetaResponse>(
      `/urlMetaApi/meta?url=${url}`,
      {
        headers: {
          Authorization: `Basic ${import.meta.env.VITE_META_API_KEY}`,
        },
      }
    );
    return response.data.meta;
  } catch (error) {
    console.error("Error fetching site data:", error);
    throw error;
  }
};
