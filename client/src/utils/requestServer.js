import axios from "axios";

const requestServer = async (path, data = {}) => {
  try {
    const token = localStorage.getItem("token");
    const backendURL = import.meta.env.VITE_SERVER_URL;
    const baseURL = import.meta.env.VITE_BASE_ROUTE;

    // Ensure URL is properly formatted
    const formattedURL = `${backendURL.replace(/\/$/, "")}/${baseURL
      .replace(/^\//, "")
      .replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

    // console.log("Request URL:", formattedURL);

    const res = await axios({
      url: formattedURL,
      method: "POST",
      data: Object.keys(data).length > 0 ? data : undefined,
      timeout: 5000,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error) {
    if (error.response) {
      console.error("Server responded with error:", error.response.data);
    } else if (error.request) {
      console.error("No response from server:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }
    throw error;
  }
};

export default requestServer;
