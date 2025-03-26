import axios from "axios";

const requestServer = async (path, data = null, options = {}) => {
  try {
    const token = localStorage.getItem("token");
    const backendURL = import.meta.env.VITE_SERVER_URL;
    const baseURL = import.meta.env.VITE_BASE_ROUTE;

    // Ensure URL is properly formatted
    const formattedURL = `${backendURL.replace(/\/$/, "")}/${baseURL
      .replace(/^\//, "")
      .replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

    // Safely handle data - ensure it's an object before using Object.keys
    let processedData = undefined;

    if (data !== null && data !== undefined) {
      if (typeof data === "object") {
        // Create a copy to avoid modifying the original object
        const dataCopy = { ...data };

        // Remove undefined values
        Object.keys(dataCopy).forEach((key) => {
          if (dataCopy[key] === undefined) {
            delete dataCopy[key];
          }
        });

        // Only set processedData if there are keys
        if (Object.keys(dataCopy).length > 0) {
          processedData = dataCopy;
        }
      } else {
        // If data is not an object but also not null/undefined, use it as is
        processedData = data;
      }
    }

    const res = await axios({
      url: formattedURL,
      method: "POST",
      data: processedData,
      timeout: 5000,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      withCredentials: true, // Ensure cookies are sent with request
      ...options, // Allow passing additional axios options
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
