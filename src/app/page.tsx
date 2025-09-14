import Hero from "@/components/Hero";
import ValuesSection from "@/components/ValuesSection";
import NewsCarousel from "@/components/NewsCarousel";
import Teams from "@/components/Teams";
import Coaches from "@/components/Coaches";
import Shop from "@/components/Shop";
import { fetchTeams } from "@/lib/actions";

export default async function Home() {
  const { data: teams, error } = await fetchTeams();

  return (
    <div className="bg-navy min-h-screen text-white">
      {/* Hero Section */}
      <Hero />

      {/* Values Section */}
      <ValuesSection />

      {/* News Carousel */}
      <NewsCarousel />

      {/* Team Previews */}
      <Teams initialTeams={teams} error={error} />

      {/* Coaches Corner */}
      <Coaches />

      {/* Shop Section */}
      <Shop />

      {/* Footer */}
      <footer className="bg-navy py-4 text-center">
        <p className="text-base">
          © 2025 WCS Basketball | Contact: info@wcsbasketball.com
        </p>
      </footer>
    </div>
  );
}
