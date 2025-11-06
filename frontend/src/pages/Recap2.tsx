import BasicStatsCard from "@/components/recap/BasicStatsCard";
import PersonalityRadar from "@/components/recap/PersonalityRadar";
import TopChampions from "@/components/recap/TopChampions";
import YearlyTimeline from "@/components/recap/YearlyTimeline";
import AchievementsGrid from "@/components/recap/AchievementsGrid";
import EmbarrassingFacts from "@/components/recap/EmbarrassingFacts";
import TeammatesCard from "@/components/recap/TeammatesCard";
import RuneBackground from "./RuneBackground";  

const Recap2 = () => {
  // Mocked data for development
  const mockData = {
    basicStats: {
      wins: 132,
      losses: 118,
      totalGames: 250,
      lpGained: 980,
      lpLost: 860,
      peakRank: "Diamond II",
      currentRank: "Diamond IV",
      favoriteRole: "Mid Lane",
    },
    personality: {
      aiDescription:
        "A cerebral control mage enjoyer who spikes mid-game. You roam when it matters and minimize risk around objectives. Highly consistent with flashes of mechanical brilliance.",
      traits: {
        aggression: 62,
        teamwork: 78,
        mechanics: 71,
        strategy: 85,
        consistency: 88,
      },
    },
    topChampions: [
      { name: "Ahri", games: 72, winrate: 57, kda: 3.6, sprite: "ahri.jpg" },
      { name: "Azir", games: 51, winrate: 54, kda: 3.1, sprite: "azir.jpg" },
      { name: "Sylas", games: 39, winrate: 59, kda: 2.9, sprite: "sylas.jpg" },
    ],
    hiddenGem: {
      champion: "Taliyah",
      yourWinrate: 64,
      pubWinrate: 49,
      differential: 15,
      games: 22,
    },
    timeline: [
      {
        month: "January",
        title: "New Season Grind",
        description: "Climbed from Platinum I to Diamond IV in two weeks",
        highlight: "7 game win streak",
        rankChange: "+1",
      },
      {
        month: "June",
        title: "Macro Mastery",
        description: "Best objective control month (92% dragons secured when first to move)",
        highlight: "Perfect Herald setups",
        rankChange: "+0",
      },
      {
        month: "September",
        title: "Slump & Recovery",
        description: "Rough patch mid-month but stabilized by playing comfort picks",
        highlight: "Swapped to Ahri & regained LP",
        rankChange: "-1",
      },
    ],
    achievements: [
      {
        id: "first_blood",
        title: "Early Bird",
        description: "First blood participation in 41% of wins",
        icon: "sword",
        rarity: "rare",
      },
      {
        id: "vision_god",
        title: "Visionary",
        description: "Top 5% warding for your rank",
        icon: "eye",
        rarity: "epic",
      },
      {
        id: "clutch",
        title: "Clutch Factor",
        description: "Won 68% of games within 2k gold difference at 20m",
        icon: "star",
        rarity: "legendary",
      },
    ],
    embarrassingFacts: [
      {
        title: "Baron Roulette",
        description: "Lost 3 barons in a row to 1k HP 50/50s",
        severity: "high",
      },
      {
        title: "Missed Smite",
        description: "Missed smite twice in one day (we've all been there)",
        severity: "medium",
      },
    ],
    teammates: [
      {
        name: "JungleDiff69",
        games: 34,
        winrate: 62,
        favoriteRole: "Jungle",
        synergy: "High",
        bestCombo: "Ahri + Lee Sin",
      },
      {
        name: "PeelForMepls",
        games: 19,
        winrate: 58,
        favoriteRole: "Support",
        synergy: "Medium",
        bestCombo: "Azir + Thresh",
      },
    ],
  };

  const name = "GigaNigga";
  const tag = "KR1";


  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="border-b border-lol-gold/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                {name}#{tag}'s Rift Rewind (Mock)
              </h1>
              <p className="text-muted-foreground mt-1">Frontend sandbox with mocked data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        <div data-section className="animate-fade-in">
          <BasicStatsCard stats={mockData.basicStats} />
        </div>

        <div data-section className="animate-fade-in">
          <PersonalityRadar personality={mockData.personality} />
        </div>

        <div data-section className="animate-fade-in">
          <TopChampions champions={mockData.topChampions} hiddenGem={mockData.hiddenGem} />
        </div>

        {mockData.timeline.length > 0 && (
          <div data-section className="animate-fade-in">
            <YearlyTimeline events={mockData.timeline} />
          </div>
        )}

        {mockData.achievements.length > 0 && (
          <div data-section className="animate-fade-in">
            <AchievementsGrid achievements={mockData.achievements} />
          </div>
        )}

        {mockData.embarrassingFacts.length > 0 && (
          <div data-section className="animate-fade-in">
            <EmbarrassingFacts facts={mockData.embarrassingFacts} />
          </div>
        )}

        {mockData.teammates.length > 0 && (
          <div data-section className="animate-fade-in">
            <TeammatesCard teammates={mockData.teammates} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-lol-gold/20 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Rift Rewind - Mock Page</p>
        </div>
      </div>
    </div>
  );
};

export default Recap2;


