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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://renatahtokutomi.com/:8080"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;