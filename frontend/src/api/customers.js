import { apiClient } from "./client";

export const customersApi = {
  list: (params) => apiClient.get("/customers", { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/customers/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post("/customers", payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/customers/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/customers/${id}`).then((r) => r.data),
};
