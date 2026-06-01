import { apiClient } from "./client";

export const ordersApi = {
  list: (params) => apiClient.get("/orders", { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/orders/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post("/orders", payload).then((r) => r.data),
  updateStatus: (id, status) =>
    apiClient.patch(`/orders/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => apiClient.delete(`/orders/${id}`).then((r) => r.data),
};
