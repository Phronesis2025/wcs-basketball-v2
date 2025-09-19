import ClientTeams from "@/components/ClientTeams";
import { fetchTeams } from "@/lib/actions";

/**
 * Teams page - Server component that fetches team data
 * Passes data to ClientTeams component for client-side rendering
 */
export default async function Teams() {
  // Fetch teams data on the server
  const { data: teams, error } = await fetchTeams();

  // Pass data to client component
  return <ClientTeams initialTeams={teams} error={error} />;
}
