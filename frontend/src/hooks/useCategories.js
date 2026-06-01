import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { categoriesApi } from "@/api/categories";
import { toast } from "@/services/toast";

const KEY = "categories";

export function useCategories() {
  return useQuery({
    queryKey: [KEY],
    queryFn: categoriesApi.list,
    staleTime: 5 * 60 * 1000, // categories rarely change
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success("Category added");
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Category removed");
    },
  });
}
