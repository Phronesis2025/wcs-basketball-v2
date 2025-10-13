// src/hooks/useDrills.ts
import { useQuery } from "@tanstack/react-query";
import { fetchPracticeDrills } from "@/lib/actions";
// import { PracticeDrill } from '@/types/supabase'; // Not used in this file

// Query keys for drills
export const drillKeys = {
  all: ["drills"] as const,
  lists: () => [...drillKeys.all, "list"] as const,
  list: (filters: string) => [...drillKeys.lists(), { filters }] as const,
};

// Hook to fetch practice drills
export function useDrills() {
  return useQuery({
    queryKey: drillKeys.lists(),
    queryFn: fetchPracticeDrills,
    staleTime: 10 * 60 * 1000, // 10 minutes (drills change less frequently)
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}
