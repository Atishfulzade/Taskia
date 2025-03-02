import axios from "axios";

const requestServer = async (path, data = {}) => {
  try {
    const token = localStorage.getItem("token");
    const backendURL = import.meta.env.VITE_SERVER_URL;
    const baseURL = import.meta.env.VITE_BASE_ROUTE;
    console.log(`${backendURL}${baseURL}${path}`);

    const res = await axios({
      url: `${backendURL}${baseURL}${path}`,
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
