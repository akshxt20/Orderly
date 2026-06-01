import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { customersApi } from "@/api/customers";
import { toast } from "@/services/toast";

const KEY = "customers";

export function useCustomers(params) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => customersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCustomer(id) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => customersApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Customer created");
    },
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => customersApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success("Customer updated");
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => customersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Customer deleted");
    },
  });
}
