// src/hooks/useTeams.ts
import { useQuery } from "@tanstack/react-query";
import { fetchTeams, fetchTeamById, fetchTeamsByCoachId } from "@/lib/actions";
// import { Team } from '@/types/supabase'; // Not used in this file

// Query keys for consistent caching
export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (filters: string) => [...teamKeys.lists(), { filters }] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
  byCoach: (coachId: string) => [...teamKeys.all, "byCoach", coachId] as const,
};

// Hook to fetch all teams
export function useTeams() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: fetchTeams,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to fetch a single team by ID
export function useTeam(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => fetchTeamById(id),
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook to fetch teams by coach ID
export function useTeamsByCoach(coachId: string) {
  return useQuery({
    queryKey: teamKeys.byCoach(coachId),
    queryFn: () => fetchTeamsByCoachId(coachId),
    enabled: !!coachId, // Only run if coachId exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
