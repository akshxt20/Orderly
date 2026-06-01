import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ordersApi } from "@/api/orders";
import { toast } from "@/services/toast";

const KEY = "orders";

// Orders mutate inventory, so they invalidate products and the dashboard too.
function invalidateOrderViews(qc) {
  qc.invalidateQueries({ queryKey: [KEY] });
  qc.invalidateQueries({ queryKey: ["products"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useOrders(params) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => ordersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => ordersApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      invalidateOrderViews(qc);
      toast.success("Order placed");
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
    onSuccess: (order) => {
      invalidateOrderViews(qc);
      qc.invalidateQueries({ queryKey: [KEY, "detail", order.id] });
      toast.success(`Order marked as ${order.status}`);
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => ordersApi.remove(id),
    onSuccess: () => {
      invalidateOrderViews(qc);
      toast.success("Order deleted, stock restored");
    },
  });
}
