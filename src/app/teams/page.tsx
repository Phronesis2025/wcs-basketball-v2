// src/app/teams/page.tsx
import ClientTeams from "@/components/ClientTeams";
import { fetchTeams } from "@/lib/actions";
import { Team } from "@/types/supabase";
import * as Sentry from "@sentry/nextjs";

export default async function Teams() {
  let teams: Team[] = [];
  let error: string | null = null;

  try {
    teams = await fetchTeams();
  } catch (err) {
    Sentry.captureException(err);
    error = err instanceof Error ? err.message : "Unknown error";
  }

  return <ClientTeams initialTeams={teams} error={error} />;
}
