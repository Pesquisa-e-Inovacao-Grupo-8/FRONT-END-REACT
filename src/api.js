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

const envName = (import.meta.env.ENV || import.meta.env.MODE || "PRD").toLowerCase();
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

const apiBaseUrl = configuredBaseUrl || {
  dev: "http://127.0.0.1:8080",
  development: "http://127.0.0.1:8080",
  qa: "http://qa.spring.renatahtokutomi.com",
  prd: "https://spring.renatahtokutomi.com",
  production: "https://spring.renatahtokutomi.com",
}[envName] || "https://spring.renatahtokutomi.com";

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;