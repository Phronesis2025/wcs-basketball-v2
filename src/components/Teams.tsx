import ClientTeams from "@/components/ClientTeams";
import { fetchTeams } from "@/lib/actions";
import { Team } from "@/types/supabase";

/**
 * Teams component - Server component wrapper
 * This component is redundant and should be removed in favor of direct page usage
 * @deprecated Use src/app/teams/page.tsx directly
 */
export default async function Teams() {
  // Fetch teams data on the server
  let teams: Team[] = [];
  let error: string | null = null;

  try {
    teams = await fetchTeams();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  // Pass data to client component
  return <ClientTeams initialTeams={teams} error={error} />;
}
