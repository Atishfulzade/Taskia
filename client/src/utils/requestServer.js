import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem(
  "token"
)}`;

const requestServer = async (path, data) => {
  try {
    const res = await axios.post(path, data);
    return res.data; // Return only the data
  } catch (error) {
    console.error("Request error:", error);
    throw error; // Re-throw error for handling in the calling function
  }
};

export default requestServer;
