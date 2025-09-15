import Hero from "@/components/Hero";
import LogoMarquee from "@/components/LogoMarquee";
import FanZone from "@/components/FanZone";
import Shop from "@/components/Shop";
import { fetchTeams } from "@/lib/actions";

export default async function Home() {
  const { error: teamsError } = await fetchTeams();
  // Temporarily disable coaches fetching due to database schema issue
  const coachesError = null;

  return (
    <div className="bg-navy min-h-screen text-white">
      <Hero />
      <LogoMarquee />
      <FanZone teamsError={teamsError} coachesError={coachesError} />
      <Shop />
    </div>
  );
}
