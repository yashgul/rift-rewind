import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import BasicStatsCard from "@/components/recap/BasicStatsCard";
import PersonalityRadar from "@/components/recap/PersonalityRadar";
import TopChampions from "@/components/recap/TopChampions";
import YearlyTimeline from "@/components/recap/YearlyTimeline";
import AchievementsGrid from "@/components/recap/AchievementsGrid";
import EmbarrassingFacts from "@/components/recap/EmbarrassingFacts";
import TeammatesCard from "@/components/recap/TeammatesCard";
import recapData from "@/data/mockRecapData.json";

const Recap = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const username = searchParams.get("username");
  const [visibleSections, setVisibleSections] = useState<number[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.75;
        if (isVisible) {
          section.classList.add('animate-fade-in');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }

    // Stagger the appearance of sections
    const delays = [0, 200, 400, 600, 800, 1000, 1200];
    delays.forEach((delay, index) => {
      setTimeout(() => {
        setVisibleSections((prev) => [...prev, index]);
      }, delay);
    });
  }, [username, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="border-b border-lol-gold/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                {username}'s Rift Rewind
              </h1>
              <p className="text-muted-foreground mt-1">Your year on the Rift</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-card border border-border hover:border-primary transition-colors rounded-lg text-foreground font-semibold"
            >
              New Recap
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {visibleSections.includes(0) && (
          <div data-section className="animate-fade-in">
            <BasicStatsCard stats={recapData.basicStats} />
          </div>
        )}

        {visibleSections.includes(1) && (
          <div data-section className="animate-fade-in">
            <PersonalityRadar personality={recapData.personality} />
          </div>
        )}

        {visibleSections.includes(2) && (
          <div data-section className="animate-fade-in">
            <TopChampions champions={recapData.topChampions} hiddenGem={recapData.hiddenGem} />
          </div>
        )}

        {visibleSections.includes(3) && (
          <div data-section className="animate-fade-in">
            <YearlyTimeline events={recapData.timeline} />
          </div>
        )}

        {visibleSections.includes(4) && (
          <div data-section className="animate-fade-in">
            <AchievementsGrid achievements={recapData.achievements} />
          </div>
        )}

        {visibleSections.includes(5) && (
          <div data-section className="animate-fade-in">
            <EmbarrassingFacts facts={recapData.embarrassingFacts} />
          </div>
        )}

        {visibleSections.includes(6) && (
          <div data-section className="animate-fade-in">
            <TeammatesCard teammates={recapData.teammates} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-lol-gold/20 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Rift Rewind - League of Legends</p>
        </div>
      </div>
    </div>
  );
};

export default Recap;
