import axios from "axios";

// Automatically read from environment variable
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

export default API;
