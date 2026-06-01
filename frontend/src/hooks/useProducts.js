import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { productsApi } from "@/api/products";
import { toast } from "@/services/toast";

const KEY = "products";

export function useProducts(params) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => productsApi.list(params),
    // Keep the previous page visible while the next one loads — no table flicker.
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => productsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product created");
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => productsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product updated");
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => productsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product deleted");
    },
  });
}
