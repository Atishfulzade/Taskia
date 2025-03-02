import axios from "axios";

const requestServer = async (path, data = {}) => {
  try {
    const token = localStorage.getItem("token");
    const baseurl = import.meta.env.VITE_SERVER_URL;
    const base_url = import.meta.env.VITE_BASE_ROUTE;
    console.log(`${baseurl}${base_url}${path}`);

    const res = await axios({
      url: `${baseurl}${base_url}${path}`,
      method: "POST",
      data: Object.keys(data).length ? data : undefined,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Request error:", error);
    throw error;
  }
};

export default requestServer;
