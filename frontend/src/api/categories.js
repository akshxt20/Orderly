import { apiClient } from "./client";

export const categoriesApi = {
  list: () => apiClient.get("/categories").then((r) => r.data),
  create: (name) => apiClient.post("/categories", { name }).then((r) => r.data),
  remove: (name) =>
    apiClient.delete(`/categories/${encodeURIComponent(name)}`).then((r) => r.data),
};
