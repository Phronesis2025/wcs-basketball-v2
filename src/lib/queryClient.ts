// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 10 minutes by default (longer for better performance)
      staleTime: 10 * 60 * 1000, // 10 minutes
      // Keep data in cache for 15 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime)
      // Retry failed requests 1 time (reduced for mobile)
      retry: 1,
      // Don't refetch on window focus (better for mobile performance)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect (we have real-time subscriptions)
      refetchOnReconnect: false,
      // Disable background refetching for better mobile performance
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});
