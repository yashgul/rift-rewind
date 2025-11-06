import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import BasicStatsCard from "@/components/recap/BasicStatsCard";
import PersonalityRadar from "@/components/recap/PersonalityRadar";
import TopChampions from "@/components/recap/TopChampions";
import YearlyTimeline from "@/components/recap/YearlyTimeline";
import AchievementsGrid from "@/components/recap/AchievementsGrid";
import EmbarrassingFacts from "@/components/recap/EmbarrassingFacts";
import TeammatesCard from "@/components/recap/TeammatesCard";

interface BasicStatsCardType {
  wins: number;
  losses: number;
  totalGames: number;
  lpGained: number;
  lpLost: number;
  peakRank: string;
  currentRank: string;
  favoriteRole: string;
}

interface PersonalityRadarType {
  aiDescription: string;
  traits: {
    aggression: number;
    teamwork: number;
    mechanics: number;
    strategy: number;
    consistency: number;
  };
}

interface RecapData {
  basicStats: BasicStatsCardType;
  personality: PersonalityRadarType;
  topChampions: Array<{
    name: string;
    games: number;
    winrate: number;
    kda: number;
    sprite: string;
  }>;
  hiddenGem: {
    champion: string;
    yourWinrate: number;
    pubWinrate: number;
    differential: number;
    games: number;
  };
  timeline: Array<{
    month: string;
    title: string;
    description: string;
    highlight: string;
    rankChange: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: string;
  }>;
  embarrassingFacts: Array<{
    title: string;
    description: string;
    severity: string;
  }>;
  teammates: Array<{
    name: string;
    games: number;
    winrate: number;
    favoriteRole: string;
    synergy: string;
    bestCombo: string;
  }>;
}

const Recap = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const name = searchParams.get("name");
  const tag = searchParams.get("tag");
  const [visibleSections, setVisibleSections] = useState<number[]>([]);
  const [recapData, setRecapData] = useState<RecapData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Transform API data to component structure
  const transformApiData = (apiData: Record<string, unknown>): RecapData => {
    const wrapped = (apiData.wrapped as Record<string, unknown>) || {};
    const stats = (apiData.stats as Record<string, unknown>) || {};
    const highlights = (apiData.highlights as Array<{title: string; description: string}>) || [];
    const champions = (apiData.champions as Record<string, unknown>) || {};
    const playstyle = (apiData.playstyle as Record<string, unknown>) || {};
    const funFacts = (apiData.funFacts as string[]) || [];

    // Map playstyle traits (handle both object and array formats)
    const playstyleTraits = playstyle.traits;
    const traitsMap: Record<string, number> = {
      aggression: 0,
      teamwork: 0,
      mechanics: 0,
      strategy: 0,
      consistency: 0,
    };
    
    if (playstyleTraits) {
      // If traits is an object (new format)
      if (typeof playstyleTraits === 'object' && !Array.isArray(playstyleTraits)) {
        const traits = playstyleTraits as Record<string, number>;
        traitsMap.aggression = traits.aggression || 0;
        traitsMap.teamwork = traits.teamwork || 0;
        traitsMap.mechanics = traits.mechanics || 0;
        traitsMap.strategy = traits.strategy || 0;
        traitsMap.consistency = traits.consistency || 0;
      } 
      // If traits is an array (old format)
      else if (Array.isArray(playstyleTraits)) {
        playstyleTraits.forEach((trait: {name: string; score: number}) => {
          const key = trait.name.toLowerCase().replace(/\s+/g, '_');
          if (key in traitsMap) {
            traitsMap[key as keyof typeof traitsMap] = trait.score;
          }
        });
      }
    }

    const championsList = ((champions.top3 as Array<{name: string; games: number; wr: number; kda?: number}>) || []);
    const hiddenGemData = (champions.hiddenGem as {name: string; games: number; winrate: number; insight?: string}) || null;

    return {
      basicStats: {
        wins: Math.round((stats.games as number || 100) * ((stats.winrate as number || 50) / 100)),
        losses: Math.round((stats.games as number || 100) * (100 - (stats.winrate as number || 50)) / 100),
        totalGames: (stats.games as number) || 100,
        lpGained: 856,
        lpLost: 723,
        peakRank: "Diamond II",
        currentRank: "Diamond IV",
        favoriteRole: "Mid Lane",
      },
      personality: {
        aiDescription: (wrapped.summary as string) || "",
        traits: {
          aggression: traitsMap['aggression'] || 0,
          teamwork: traitsMap['teamwork'] || 0,
          mechanics: traitsMap['mechanics'] || 0,
          strategy: traitsMap['strategy'] || 0,
          consistency: traitsMap['consistency'] || 0,
        },
      },
      topChampions: championsList.map((champ: {name: string; games: number; wr: number; kda?: number}) => ({
        name: champ.name,
        games: champ.games,
        winrate: champ.wr,
        kda: champ.kda || 0,
        sprite: `${champ.name.toLowerCase()}.jpg`,
      })),
      hiddenGem: hiddenGemData ? {
        champion: hiddenGemData.name,
        yourWinrate: hiddenGemData.winrate,
        pubWinrate: 50,
        differential: hiddenGemData.winrate - 50,
        games: hiddenGemData.games,
      } : {
        champion: "Unknown",
        yourWinrate: 0,
        pubWinrate: 50,
        differential: -50,
        games: 0,
      },
      timeline: [],
      achievements: highlights.map((highlight: {title: string; description: string}, index: number) => ({
        id: `achievement_${index}`,
        title: highlight.title,
        description: highlight.description,
        icon: "star",
        rarity: "epic",
      })),
      embarrassingFacts: funFacts.map((fact: string, index: number) => ({
        title: `Fact ${index + 1}`,
        description: fact,
        severity: index % 2 === 0 ? "high" : "medium",
      })),
      teammates: [],
    };
  };

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
    if (!name || !tag) {
      navigate("/");
      return;
    }

    // Try to get data from localStorage
    const storedData = localStorage.getItem('recapData');
    if (!storedData) {
      console.error("No recap data in localStorage");
      setError("No recap data found. Please try generating your recap again.");
      return;
    }

    try {
      console.log("Raw stored data:", storedData.substring(0, 200) + "...");
      const apiData = JSON.parse(storedData);
      console.log("Parsed API data:", apiData);
      
      const transformedData = transformApiData(apiData);
      console.log("Transformed data:", transformedData);
      
      setRecapData(transformedData);
      // Clear the stored data after using it
      localStorage.removeItem('recapData');
      localStorage.removeItem('riotId');
    } catch (err) {
      console.error("Error parsing/transforming stored data:", err);
      console.error("Error details:", err instanceof Error ? err.message : String(err));
      if (err instanceof Error && err.stack) {
        console.error("Stack trace:", err.stack);
      }
      setError(`Failed to load recap data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return;
    }

    // Stagger the appearance of sections
    const delays = [0, 200, 400, 600, 800, 1000, 1200];
    delays.forEach((delay, index) => {
      setTimeout(() => {
        setVisibleSections((prev) => [...prev, index]);
      }, delay);
    });
  }, [name, tag, navigate]);

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <h2 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            Error Loading Recap
          </h2>
          <p className="text-red-400 font-rajdhani text-lg">
            {error}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-card border border-border hover:border-primary transition-colors rounded-lg text-foreground font-semibold"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Show loading state if data is not ready
  if (!recapData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground animate-pulse">Loading your recap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="border-b border-lol-gold/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                {name}#{tag}'s Rift Rewind
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

        {visibleSections.includes(3) && recapData.timeline.length > 0 && (
          <div data-section className="animate-fade-in">
            <YearlyTimeline events={recapData.timeline} />
          </div>
        )}

        {visibleSections.includes(4) && recapData.achievements.length > 0 && (
          <div data-section className="animate-fade-in">
            <AchievementsGrid achievements={recapData.achievements} />
          </div>
        )}

        {visibleSections.includes(5) && recapData.embarrassingFacts.length > 0 && (
          <div data-section className="animate-fade-in">
            <EmbarrassingFacts facts={recapData.embarrassingFacts} />
          </div>
        )}

        {visibleSections.includes(6) && recapData.teammates.length > 0 && (
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
