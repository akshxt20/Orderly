import { apiClient } from "./client";

export const salesApi = {
  list: (params) => apiClient.get("/sales", { params }).then((r) => r.data),
  create: (payload) => apiClient.post("/sales", payload).then((r) => r.data),
  update: (id, payload) => apiClient.patch(`/sales/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/sales/${id}`).then((r) => r.data),
};
