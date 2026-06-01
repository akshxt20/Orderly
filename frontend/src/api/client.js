import axios from "axios";

// Falls back to the local docker-compose backend when VITE_API_URL is unset.
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Collapse the backend's {error, message, detail} envelope into a normal Error
// so every caller (and React Query) sees a consistent shape: err.message for
// display, err.code to branch on, err.detail for field-level info.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const envelope = error.response?.data;
    const normalized = new Error(
      envelope?.message || error.message || "Request failed",
    );
    normalized.code = envelope?.error || "NETWORK_ERROR";
    normalized.detail = envelope?.detail ?? null;
    normalized.status = error.response?.status ?? 0;
    return Promise.reject(normalized);
  },
);
