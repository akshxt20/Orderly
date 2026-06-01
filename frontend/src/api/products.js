import { apiClient } from "./client";

// One object per resource keeps the call sites tidy: productsApi.create(...).
export const productsApi = {
  list: (params) => apiClient.get("/products", { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/products/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post("/products", payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/products/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/products/${id}`).then((r) => r.data),
};
