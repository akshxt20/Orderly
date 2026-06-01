import { MutationCache, QueryClient } from "@tanstack/react-query";

import { toast } from "./toast";

// Centralising mutation errors here means individual components only have to
// handle the happy path — every failed create/update/delete surfaces the
// backend's message as a toast automatically.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000, // 30s: data is fresh enough that quick nav doesn't refetch
    },
  },
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(error?.message || "Something went wrong");
    },
  }),
});
