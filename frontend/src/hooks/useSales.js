import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { salesApi } from "@/api/sales";
import { toast } from "@/services/toast";

const KEY = "sales";

// A sale changes product pricing, so it invalidates products and the dashboard
// alongside the sales list.
function invalidateSaleViews(qc) {
  qc.invalidateQueries({ queryKey: [KEY] });
  qc.invalidateQueries({ queryKey: ["products"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useSales(params) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => salesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.create,
    onSuccess: () => {
      invalidateSaleViews(qc);
      toast.success("Sale created");
    },
  });
}

export function useUpdateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => salesApi.update(id, payload),
    onSuccess: () => {
      invalidateSaleViews(qc);
      toast.success("Sale updated");
    },
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => salesApi.remove(id),
    onSuccess: () => {
      invalidateSaleViews(qc);
      toast.success("Sale removed");
    },
  });
}
