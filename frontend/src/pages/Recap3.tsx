import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import mockRecapData from "@/data/mockRecapData.json";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
  champions?: {
    main?: {
      name: string;
      games: number;
      winrate: number;
      kda: number;
      insight: string;
    };
    top3?: Array<{
      name: string;
      games: number;
      wr: number;
    }>;
    hiddenGem?: {
      name: string;
      games: number;
      winrate: number;
      insight: string;
    };
  };
  topChampions?: Array<{
    name: string;
    games: number;
    winrate: number;
    kda: number;
    sprite: string;
  }>;
  hiddenGem?: {
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

type SlideDescriptor = {
  id: string;
  label: string;
  background: string;
  video?: string;
  content: ReactNode;
};

const highlightQuotes: Record<string, string> = {
  legendary: "Legendary presence on the Rift.",
  epic: "Moments they will remember.",
  rare: "Consistency that wins games.",
};

const traitLabels: Record<keyof RecapData["personality"]["traits"], string> = {
  aggression: "Aggression",
  teamwork: "Teamwork",
  mechanics: "Mechanics",
  strategy: "Strategy",
  consistency: "Consistency",
};

export default function Recap3() {
  const navigate = useNavigate();
  const recapData = mockRecapData as RecapData;

  const {
    wins,
    losses,
    totalGames,
    lpGained,
    lpLost,
    peakRank,
    currentRank,
    favoriteRole,
  } = recapData.basicStats;

  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0";
  const netLp = lpGained - lpLost;

  const statSummary = [
    { label: "Total Games", value: totalGames.toLocaleString() },
    { label: "Win Rate", value: `${winRate}%` },
    { label: "Net LP", value: `${netLp >= 0 ? "+" : ""}${netLp}` },
    { label: "Peak Rank", value: peakRank },
    { label: "Current Rank", value: currentRank },
    { label: "Favorite Role", value: favoriteRole },
  ];

  // Handle new champions structure or fall back to old structure
  const championsData = recapData.champions;
  const topChampions = championsData?.top3 
    ? championsData.top3.map(champ => ({ name: champ.name, games: champ.games, winrate: champ.wr, kda: 0 }))
    : recapData.topChampions || [];
  
  const hiddenGem = championsData?.hiddenGem 
    ? {
        champion: championsData.hiddenGem.name,
        yourWinrate: championsData.hiddenGem.winrate,
        games: championsData.hiddenGem.games,
        insight: championsData.hiddenGem.insight,
      }
    : recapData.hiddenGem 
    ? {
        champion: recapData.hiddenGem.champion,
        yourWinrate: recapData.hiddenGem.yourWinrate,
        games: recapData.hiddenGem.games,
        insight: null,
      }
    : null;

  const mainChampion = championsData?.main;

  const timelineMilestones = recapData.timeline.slice(0, 4);
  const teammateHighlights = recapData.teammates.slice(0, 3);

  const funFacts = [
    hiddenGem 
      ? hiddenGem.insight 
        ? hiddenGem.insight
        : `Hidden gem ${hiddenGem.champion} boasts a ${hiddenGem.yourWinrate.toFixed(1)}% win rate.`
      : null,
    `You gained ${lpGained} LP and dropped ${lpLost} LP throughout the climb.`,
    teammateHighlights[0]
      ? `Best duo: ${teammateHighlights[0].name} (${teammateHighlights[0].winrate.toFixed(1)}% win rate together).`
      : null,
    `Favorite lane: ${favoriteRole}.`,
  ].filter(Boolean) as string[];

  const achievements = recapData.achievements.slice(0, 4).map((achievement) => ({
    ...achievement,
    quote: highlightQuotes[achievement.rarity] ?? "Forged through countless queues.",
  }));

  const embarrassingMoments = recapData.embarrassingFacts.slice(0, 3);
  const traitEntries = Object.entries(recapData.personality.traits) as Array<[
    keyof RecapData["personality"]["traits"],
    number
  ]>;
  const primaryTagline = recapData.personality.aiDescription;
  const closingMessage =
    "You navigated the climb with precision, turned setbacks into opportunities, and closed the season in style. Queue up — 2026 is waiting.";

  // State declarations
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImages, setHeroImages] = useState<Array<{ name: string; image: string }>>([]);

  // Load hero images
  useEffect(() => {
    fetch("/hero_images.json")
      .then(res => res.json())
      .then(data => setHeroImages(data))
      .catch(() => console.warn("Failed to load hero images"));
  }, []);

  // Helper function to get champion image
  const getChampionImage = (championName: string): string | undefined => {
    const champion = heroImages.find(
      (hero) => 
        hero.name.toLowerCase() === championName.toLowerCase().replace(/['\s]/g, '')
    );
    return champion?.image;
  };

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") return;

    const sharePayload = {
      title: "Rift Rewind",
      text: "Check out my League of Legends season recap",
      url: window.location.href,
    } satisfies ShareData;

    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(sharePayload.url);
        console.info("Recap link copied to clipboard");
      }
    } catch (error) {
      console.warn("Sharing recap failed", error);
    }
  }, []);

  const overviewSlide: ReactNode = (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col justify-center gap-4 sm:gap-6">
      {/* Header with logo and name */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div
          className="h-20 w-20 shrink-0 rounded-sm border-2 border-[#c89b3c] bg-cover bg-center shadow-xl sm:h-28 sm:w-28 sm:border-4"
          style={{ backgroundImage: "url('/rift_logo.png')" }}
          aria-label="Rift Rewind logo"
        />
        <div>
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">MockPlayer#NA1</p>
          <p className="mt-1 text-sm uppercase tracking-[0.3em] text-[#c89b3c] sm:mt-2 sm:text-base">Season 2025</p>
        </div>
      </div>

      {/* Season Snapshot - Table style */}
      <div className="rounded-sm border-2 border-[#785a28] bg-[#0b1426]/90 p-4 shadow-2xl sm:p-6">
        <h3 className="mb-4 text-lg font-bold uppercase tracking-[0.2em] text-[#c89b3c] sm:text-xl">Season Snapshot</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {statSummary.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between border-b-2 border-[#273241] bg-[#0a1428]/60 p-3"
            >
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#a09b8c] sm:text-sm">{stat.label}</p>
              <p className="text-xl font-bold text-white sm:text-2xl">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Season Motto */}
      <div className="border-t-2 border-[#785a28] pt-4 text-center sm:pt-5">
        <p className="text-xs uppercase tracking-[0.3em] text-[#c89b3c]">Season Motto</p>
        <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">Calculated Playmaker</p>
      </div>
    </div>
  );

  const medals = [
    { image: "/gold.png", label: "Gold", color: "#FFD700" },
    { image: "/silver.png", label: "Silver", color: "#C0C0C0" },
    { image: "/bronze.png", label: "Bronze", color: "#CD7F32" },
  ];

  const championsSlide: ReactNode = (
    <div className="mx-auto flex h-full w-full max-w-[1400px] items-center gap-6 sm:gap-8">
      {/* Main Content Area: Champions + Sidebar */}
      <div className="grid h-full w-full gap-6 lg:grid-cols-[1fr,auto,380px] lg:gap-8">
        {/* Three Champion Cards - Full Height */}
        <div className="grid h-full gap-4 sm:gap-6 lg:grid-cols-3">
          {topChampions.slice(0, 3).map((champion, index) => {
            const championImage = getChampionImage(champion.name);
            
            return (
              <div
                key={champion.name}
                className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-[#c89b3c]/50 bg-[#0b1426]/95 transition-all duration-300 hover:border-[#c89b3c] hover:shadow-[#c89b3c]/10"
              >
                {/* Rank Badge - Top Left */}
                <div className="absolute left-4 top-4 z-10">
                  <div className="flex h-7 w-7 items-center justify-center rounded border border-[#c89b3c]/60 bg-[#0a1428]/80">
                    <span className="text-xs font-medium text-[#c89b3c]">{index + 1}</span>
                  </div>
                </div>

                {/* Champion Image/Portrait - Takes most of the space */}
                <div className="relative flex-1 overflow-hidden bg-[#050b16]">
                  {championImage ? (
                    <img
                      src={championImage}
                      alt={champion.name}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a2336] to-[#0a1428]">
                      <span className="text-4xl font-bold text-[#c89b3c]">{champion.name.charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* Champion Name and Stats - Bottom */}
                <div className="border-t border-[#785a28]/30 bg-[#0a1428]/40 p-4">
                  <p className="text-lg font-semibold text-white sm:text-xl">{champion.name}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-[#a09b8c] sm:text-sm">
                    <span>{champion.winrate.toFixed(1)}%</span>
                    <span>•</span>
                    <span>{champion.games} games</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vertical Separator */}
        <div className="hidden h-full w-px bg-[#c89b3c]/30 lg:block" />

        {/* Right Sidebar - Full Height */}
        <div className="flex h-full flex-col justify-center gap-4 sm:gap-6 lg:w-[380px]">
          {/* MAIN CHAMPION Section (if available) */}
          {mainChampion && (
            <div className="rounded-sm border border-[#c89b3c]/50 bg-[#0b1426]/95 p-4 sm:p-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c89b3c]/70 sm:text-xs">MAIN</p>
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  {/* Champion Portrait */}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-[#050b16] sm:h-16 sm:w-16">
                    {getChampionImage(mainChampion.name) ? (
                      <img
                        src={getChampionImage(mainChampion.name)}
                        alt={mainChampion.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a2336] to-[#0a1428]">
                        <span className="text-base font-bold text-[#c89b3c]">{mainChampion.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  {/* Champion Info */}
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-white sm:text-xl">{mainChampion.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#a09b8c] sm:text-sm">
                      <span>{mainChampion.winrate.toFixed(1)}%</span>
                      <span>•</span>
                      <span>{mainChampion.games}</span>
                      <span>•</span>
                      <span>{mainChampion.kda.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                {mainChampion.insight && (
                  <p className="mt-3 text-xs leading-relaxed text-[#d1c6ac]/80 sm:text-sm">
                    {mainChampion.insight}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* HIDDEN GEM Section */}
          {hiddenGem && (
            <div className="rounded-sm border border-[#c89b3c]/50 bg-[#0b1426]/95 p-4 sm:p-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c89b3c]/70 sm:text-xs">HIDDEN GEM</p>
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  {/* Champion Portrait */}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-[#050b16] sm:h-16 sm:w-16">
                    {getChampionImage(hiddenGem.champion) ? (
                      <img
                        src={getChampionImage(hiddenGem.champion)}
                        alt={hiddenGem.champion}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a2336] to-[#0a1428]">
                        <span className="text-base font-bold text-[#c89b3c]">{hiddenGem.champion.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  {/* Champion Info */}
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-white sm:text-xl">{hiddenGem.champion}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#a09b8c] sm:text-sm">
                      <span className="text-green-400">{hiddenGem.yourWinrate.toFixed(0)}%</span>
                      <span>•</span>
                      <span>{hiddenGem.games}</span>
                    </div>
                  </div>
                </div>
                {hiddenGem.insight && (
                  <p className="mt-3 text-xs leading-relaxed text-[#d1c6ac]/80 sm:text-sm">
                    {hiddenGem.insight}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ROLE IDENTITY Section */}
          <div className="rounded-sm border border-[#c89b3c]/50 bg-[#0b1426]/95 p-4 sm:p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c89b3c]/70 sm:text-xs">ROLE</p>
            <div className="mt-3 flex items-center gap-3">
              {/* Shield Icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c89b3c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-full w-full opacity-60"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              {/* Role Info */}
              <div className="flex-1">
                <p className="text-lg font-semibold text-white sm:text-xl">{favoriteRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const personalitySlide: ReactNode = (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col justify-center gap-3 sm:gap-4">
      {/* Top Row: Achievements & Embarrassing Moments */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {/* Achievements */}
        <div className="rounded-sm border-2 border-[#785a28] bg-[#0b1426]/90 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] sm:text-sm">Achievements</p>
          <div className="mt-3 grid gap-2 sm:mt-4 sm:gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-sm border-l-4 border-[#c89b3c] bg-[#091222]/80 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white sm:text-base">{achievement.title}</p>
                    <p className="mt-1 text-xs text-[#d1c6ac]">{achievement.description}</p>
                  </div>
                  <span className="shrink-0 rounded-sm bg-[#785a28]/30 px-2 py-1 text-[10px] uppercase text-[#c89b3c]">
                    {achievement.rarity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Embarrassing Moments */}
        <div className="rounded-sm border-2 border-[#785a28] bg-[#0b1426]/90 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] sm:text-sm">Embarrassing Moments</p>
          <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
            {embarrassingMoments.map((moment) => (
              <div
                key={moment.title}
                className="rounded-sm border-l-4 border-red-600 bg-[#091222]/80 p-3"
              >
                <p className="text-sm font-bold text-white sm:text-base">{moment.title}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-red-400">
                  {moment.severity} Severity
                </p>
                <p className="mt-1 text-xs text-[#d1c6ac]">{moment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: AI Personality Radar & Fun Facts */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        {/* AI Personality Radar Chart */}
        <div className="rounded-sm border-2 border-[#785a28] bg-[#0b1426]/90 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] sm:text-sm">AI Personality Read</p>
          <p className="mt-2 text-xl font-bold text-white sm:text-2xl">Calculated Risk-Taker</p>
          <p className="mt-2 text-xs text-[#d1c6ac] sm:text-sm">{primaryTagline}</p>
          
          <div className="mt-3 flex items-center justify-center sm:mt-4">
            <ChartContainer
              config={{
                value: {
                  label: "Score",
                  color: "#c89b3c",
                },
              }}
              className="mx-auto aspect-square max-h-[280px] w-full"
            >
              <RadarChart
                data={traitEntries.map(([key, value]) => ({
                  trait: traitLabels[key],
                  value: value,
                }))}
              >
                <ChartTooltip 
                  cursor={false} 
                  content={<ChartTooltipContent hideLabel className="bg-[#0a1428] border-[#785a28]" />} 
                />
                <PolarAngleAxis 
                  dataKey="trait" 
                  tick={{ fill: "#a09b8c", fontSize: 11 }}
                  tickLine={false}
                />
                <PolarGrid 
                  stroke="#3a4658"
                  strokeWidth={1.5}
                />
                <Radar
                  dataKey="value"
                  fill="#c89b3c"
                  fillOpacity={0.6}
                  stroke="#d8ac4d"
                  strokeWidth={3}
                />
              </RadarChart>
            </ChartContainer>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="rounded-sm border-2 border-[#785a28] bg-[#0b1426]/90 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] sm:text-sm">Fun Facts</p>
          <ul className="mt-3 space-y-3 text-xs text-[#f0e6d2] sm:mt-4 sm:text-sm">
            {funFacts.map((fact, index) => (
              <li key={fact} className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#785a28] text-[10px] font-bold text-white sm:h-6 sm:w-6 sm:text-xs">
                  {index + 1}
                </span>
                <span className="pt-0.5">{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const timelineSlide: ReactNode = (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col gap-4 sm:gap-6 lg:gap-8">
      <div className="grid flex-1 gap-4 sm:gap-6 xl:grid-cols-[1.2fr,0.8fr] xl:gap-8">
        <div className="rounded-sm border border-[#273241] bg-[#0b1426]/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#c89b3c]">Milestones</p>
          <div className="mt-6 space-y-6">
            {timelineMilestones.map((event) => (
              <div key={event.title} className="relative pl-6">
                <span className="absolute left-0 top-2 h-3 w-3 rounded-full border border-[#c89b3c] bg-[#0a1428]" />
                <p className="text-xs uppercase tracking-[0.3em] text-[#a09b8c]">
                  {event.month} · {event.rankChange}
                </p>
                <p className="mt-1 text-lg font-semibold text-white">{event.title}</p>
                <p className="mt-2 text-sm text-[#d1c6ac]">{event.description}</p>
                <p className="mt-1 text-xs text-[#a09b8c]">Highlight: {event.highlight}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-sm border border-[#273241] bg-[#0b1426]/70 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#c89b3c]">Teammate Synergy</p>
            <div className="mt-4 space-y-4">
              {teammateHighlights.map((teammate) => (
                <div
                  key={teammate.name}
                  className="rounded-sm border border-[#273241] bg-[#091222]/80 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-white">{teammate.name}</p>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#a09b8c]">
                      {teammate.favoriteRole}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#c89b3c]">
                    {teammate.winrate.toFixed(1)}% win rate · {teammate.games} games
                  </p>
                  <p className="mt-3 text-xs text-[#d1c6ac]">{teammate.synergy}</p>
                  <p className="mt-2 text-xs text-[#a09b8c]">Best Combo: {teammate.bestCombo}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-sm border border-[#273241] bg-[#0b1426]/60 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#c89b3c]">Season Send-off</p>
            <p className="mt-3 text-sm text-[#d1c6ac]">{closingMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const slides: SlideDescriptor[] = [
    {
      id: "overview",
      label: "Overview",
      background: "bg-gradient-to-br from-[#0a1428] via-[#111c32] to-[#1a2336]",
      video: "/1.webm",
      content: overviewSlide,
    },
    {
      id: "champions",
      label: "Mastery",
      background: "bg-gradient-to-br from-[#0a1428] via-[#1b2a3a] to-[#132238]",
      video: "/2.webm",
      content: championsSlide,
    },
    {
      id: "personality",
      label: "Highlights",
      background: "bg-gradient-to-br from-[#0a1428] via-[#161f33] to-[#1c2a3f]",
      video: "/animated-piltover.webm",
      content: personalitySlide,
    },
    {
      id: "timeline",
      label: "Season Journey",
      background: "bg-gradient-to-br from-[#0a1428] via-[#122036] to-[#1a2f46]",
      video: "/4.webm",
      content: timelineSlide,
    },
  ];

  const totalSlides = slides.length;
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentSlide) {
          video.play().catch(() => {
          });
        } else {
          video.pause();
        }
      }
    });
  }, [currentSlide]);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;
      setCurrentSlide(index);
    },
    [totalSlides]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.code === "ArrowRight" ||
        event.code === "ArrowDown" ||
        event.code === "Space" ||
        event.code === "Enter"
      ) {
        event.preventDefault();
        goNext();
      }
      if (event.code === "ArrowLeft" || event.code === "ArrowUp") {
        event.preventDefault();
        goPrev();
      }
    },
    [goNext, goPrev]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="h-screen overflow-hidden bg-[#050b16] text-[#f0e6d2]">
      <div className="relative flex h-screen flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-[#785a28] px-4 py-3 sm:px-6 sm:py-3 lg:px-10">
          <div className="flex items-center gap-3 text-[#c89b3c]">
            <div className="h-6 w-6 sm:h-8 sm:w-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-full w-full"
              >
                <path d="M8.526 1.115 8 0 0 7.298l.526.474L8 1.589l7.474 6.183.526-.474L8.526 1.115Z" />
                <path d="M1.383 8.513 8 14.41l6.617-5.897L8 2.587 1.383 8.513ZM8 16l8-7.103V6.93l-8 7.103L0 6.93v1.964L8 16Z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] sm:text-xs">Rift Rewind</p>
              <h1 className="text-sm font-bold uppercase tracking-[0.15em] sm:text-base lg:text-lg">Season 2025</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hidden rounded-sm border border-[#785a28] px-3 py-1.5 text-xs font-semibold text-[#f0e6d2] transition-colors hover:bg-[#1b2a3a] sm:block sm:text-sm"
            >
              Start New
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-sm bg-[#c89b3c] px-3 py-1.5 text-xs font-semibold text-[#0a1428] transition-colors hover:bg-[#d8ac4d] sm:text-sm"
            >
              Share
            </button>
            <div
              className="h-8 w-8 rounded-sm border-2 border-[#c89b3c] bg-cover bg-center sm:h-10 sm:w-10"
              style={{ backgroundImage: "url('/rift_logo.png')" }}
              aria-label="Player crest"
            />
          </div>
        </header>

        <main className="relative flex-1 overflow-hidden">
          <div
            className="flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => {
              return (
                <section
                  key={slide.id}
                  className={`relative flex h-full min-w-full flex-col overflow-hidden px-4 py-3 text-[#f0e6d2] sm:px-6 sm:py-4 lg:px-10 lg:py-6 ${slide.background}`}
                >
                  {/* Default video background */}
                  {slide.video && (
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      loop
                      muted
                      playsInline
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
                    >
                      <source src={slide.video} type="video/webm" />
                    </video>
                  )}
                  
                  {/* Gradient overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 20% 20%, rgba(200, 155, 60, 0.2), transparent 55%), radial-gradient(circle at 80% 10%, rgba(17, 28, 50, 0.6), transparent 50%)",
                    }}
                  />
                  
                  <div className="relative z-[1] flex h-full flex-col">{slide.content}</div>
                </section>
              );
            })}
          </div>
        </main>

        <div className="shrink-0 border-t border-[#273241] bg-[#050b16] px-4 py-2 sm:px-6 sm:py-3 lg:px-10">
          <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to ${slide.label}`}
                  aria-current={index === currentSlide ? "page" : undefined}
                  className={`h-2 rounded-full transition-all sm:h-2.5 ${
                    index === currentSlide ? "w-10 bg-[#c89b3c] sm:w-12" : "w-6 bg-[#2c3542] hover:bg-[#3a4658] sm:w-8"
                  }`}
                  onClick={() => goToIndex(index)}
                />
              ))}
            </div>
            <p className="hidden text-xs uppercase tracking-[0.25em] text-[#a09b8c] sm:block">
              {slides[currentSlide]?.label}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="rounded-sm border border-[#785a28] px-3 py-1.5 text-xs font-semibold text-[#f0e6d2] transition-colors hover:bg-[#1b2a3a] sm:text-sm"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={goNext}
                className="rounded-sm bg-[#c89b3c] px-3 py-1.5 text-xs font-semibold text-[#0a1428] transition-colors hover:bg-[#d8ac4d] sm:text-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


