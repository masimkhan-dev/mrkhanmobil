import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes default stale time
        gcTime: 1000 * 60 * 30, // 30 minutes garbage collection time
        refetchOnWindowFocus: false, // disable automatic query refetch on window focus
        refetchOnReconnect: false, // disable automatic query refetch on network reconnect
        retry: false, // disable automatic query retries
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent", // Automatically prefetch routes on link hover/focus
    defaultPreloadStaleTime: 1000 * 60 * 5, // Keep prefetch data in cache for 5 minutes
  });

  return router;
};
