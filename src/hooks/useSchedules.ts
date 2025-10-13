// src/hooks/useSchedules.ts
import { useQuery } from "@tanstack/react-query";
import { fetchSchedulesByTeamId } from "@/lib/actions";
// import { Schedule } from '@/types/supabase'; // Not used in this file

// Query keys for schedules
export const scheduleKeys = {
  all: ["schedules"] as const,
  lists: () => [...scheduleKeys.all, "list"] as const,
  list: (teamId: string) => [...scheduleKeys.lists(), teamId] as const,
};

// Hook to fetch schedules by team ID
export function useSchedules(teamId: string) {
  return useQuery({
    queryKey: scheduleKeys.list(teamId),
    queryFn: () => fetchSchedulesByTeamId(teamId),
    enabled: !!teamId, // Only run if teamId exists
    staleTime: 2 * 60 * 1000, // 2 minutes (schedules change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
