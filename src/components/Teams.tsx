import ClientTeams from "@/components/ClientTeams";
import { fetchTeams } from "@/lib/actions";

/**
 * Teams component - Server component wrapper
 * This component is redundant and should be removed in favor of direct page usage
 * @deprecated Use src/app/teams/page.tsx directly
 */
export default async function Teams() {
  // Fetch teams data on the server
  const { data: teams, error } = await fetchTeams();

  // Pass data to client component
  return <ClientTeams initialTeams={teams} error={error} />;
}
