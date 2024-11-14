interface Site {
  theme_color: string;
  favicon: string;
  logo: string;
}

interface Meta {
  title: string;
  description: string;
  site: Site;
  image: string;
}

interface MetaResponse {
  meta: Meta;
}

export const fetchSiteDataApi = async (url: string): Promise<Meta> => {
  try {
    const response = await fetch(`/urlMetaApi/meta?url=${url}`, {
      headers: {
        Authorization: `Basic ${import.meta.env.VITE_META_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching site data");
    }

    const data: MetaResponse = await response.json();
    return data.meta;
  } catch (error) {
    console.error("Error fetching site data:", error);
    throw error;
  }
};
