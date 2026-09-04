import axios from "axios";

export function normalizeArray(value) {
  if (Array.isArray(value)) return value;

  if (!value || typeof value !== "object") return [];

  const candidates = [value.data, value.content, value.items, value.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

const env = import.meta.env.MODE || "PRD";
var VITE_API_BASE_URL 

if (env === "DEV") {
  VITE_API_BASE_URL = "https://127.0.0.1:8080";
} else if (env === "QA") {
  VITE_API_BASE_URL = "https://qa.spring.renatahtokutomi.com";
} else if (env === "PRD") {
  VITE_API_BASE_URL = "https://spring.renatahtokutomi.com";
} 

const api = axios.create({
    baseURL: VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;