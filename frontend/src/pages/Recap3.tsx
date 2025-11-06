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

  const hiddenGem = recapData.hiddenGem;
  const timelineMilestones = recapData.timeline.slice(0, 4);
  const teammateHighlights = recapData.teammates.slice(0, 3);

  const funFacts = [
    `Hidden gem ${hiddenGem.champion} boasts a ${hiddenGem.differential.toFixed(1)}% win rate lead over the meta.`,
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
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col justify-center gap-3 sm:gap-4">
      {/* Vertical Banner Cards for Top 3 Champions */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        {recapData.topChampions.slice(0, 3).map((champion, index) => {
          const medal = medals[index];
          return (
            <div
              key={champion.name}
              className="group relative flex flex-col items-center overflow-hidden rounded-sm border-2 border-[#785a28] bg-gradient-to-b from-[#0b1426]/95 to-[#050b16]/95 p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-[#c89b3c] hover:shadow-[#c89b3c]/20 sm:p-5"
              onMouseEnter={() => setHoveredChampion(champion.name)}
              onMouseLeave={() => setHoveredChampion(null)}
            >
              {/* Ornate top decoration */}
              <div className="mb-3 h-1 w-full bg-gradient-to-r from-transparent via-[#c89b3c] to-transparent sm:mb-4" />
              
              {/* Medal Badge - Large and centered */}
              <div className="mb-3 h-20 w-20 sm:mb-4 sm:h-24 sm:w-24">
                <img 
                  src={medal.image} 
                  alt={medal.label} 
                  className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-110" 
                />
              </div>
              
              {/* Champion Name Plate */}
              <div className="mb-4 w-full rounded-sm border border-[#785a28] bg-[#0a1428]/80 p-3 text-center">
                <p className="text-xl font-bold text-white sm:text-2xl">{champion.name}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#c89b3c] sm:text-xs">
                  {index === 0 ? "Signature" : `Rank #${index + 1}`}
                </p>
              </div>

              {/* Stats Section */}
              <div className="w-full flex-1 space-y-2 sm:space-y-3">
                <div className="rounded-sm border-t-2 border-[#785a28] bg-[#0a1428]/60 p-2 text-center sm:p-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#a09b8c] sm:text-xs">Games</p>
                  <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{champion.games}</p>
                </div>
                <div className="rounded-sm border-t-2 border-[#785a28] bg-[#0a1428]/60 p-2 text-center sm:p-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#a09b8c] sm:text-xs">Win Rate</p>
                  <p className="mt-1 text-2xl font-bold text-[#c89b3c] sm:text-3xl">{champion.winrate.toFixed(1)}%</p>
                </div>
                <div className="rounded-sm border-t-2 border-[#785a28] bg-[#0a1428]/60 p-2 text-center sm:p-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#a09b8c] sm:text-xs">KDA</p>
                  <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{champion.kda.toFixed(1)}</p>
                </div>
              </div>

              {/* Bottom decoration */}
              <div className="mt-3 h-1 w-full bg-gradient-to-r from-transparent via-[#785a28] to-transparent sm:mt-4" />
            </div>
          );
        })}
      </div>

      {/* Hidden Gem & Role Identity Row */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <div className="rounded-sm border-2 border-[#785a28] bg-[#0b1426]/90 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] sm:text-sm">Hidden Gem</p>
          <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{hiddenGem.champion}</p>
          <p className="mt-1 text-base text-[#c89b3c] sm:text-lg">+{hiddenGem.differential.toFixed(1)}% Above Meta</p>
          <div className="mt-3 flex items-center gap-3 border-t border-[#273241] pt-3 sm:gap-4">
            <div>
              <p className="text-[10px] text-[#a09b8c] sm:text-xs">Your WR</p>
              <p className="text-lg font-bold text-white sm:text-xl">{hiddenGem.yourWinrate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-[#a09b8c] sm:text-xs">Avg WR</p>
              <p className="text-lg font-bold text-white sm:text-xl">{hiddenGem.pubWinrate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-[#a09b8c] sm:text-xs">Games</p>
              <p className="text-lg font-bold text-white sm:text-xl">{hiddenGem.games}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-sm border-2 border-[#785a28] bg-[#0b1426]/90 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] sm:text-sm">Role Identity</p>
          <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{favoriteRole}</p>
          <p className="mt-1 text-base text-[#c89b3c] sm:text-lg">Primary Position</p>
          <div className="mt-3 border-t border-[#273241] pt-3">
            <p className="text-xs text-[#d1c6ac] sm:text-sm">
              Your most played role throughout the season, where you made the biggest impact.
            </p>
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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredChampion, setHoveredChampion] = useState<string | null>(null);
  const [heroImages, setHeroImages] = useState<Array<{ name: string; image: string }>>([]);
  const totalSlides = slides.length;
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Load hero images
  useEffect(() => {
    fetch("/hero_images.json")
      .then(res => res.json())
      .then(data => setHeroImages(data))
      .catch(() => console.warn("Failed to load hero images"));
  }, []);

  const getChampionImage = (championName: string): string | undefined => {
    const champion = heroImages.find(
      (hero) => 
        hero.name.toLowerCase() === championName.toLowerCase().replace(/['\s]/g, '')
    );
    return champion?.image;
  };

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
              const isChampionsSlide = slide.id === "champions";
              const championImage = isChampionsSlide && hoveredChampion ? getChampionImage(hoveredChampion) : null;
              
              return (
                <section
                  key={slide.id}
                  className={`relative flex h-full min-w-full flex-col overflow-hidden px-4 py-3 text-[#f0e6d2] sm:px-6 sm:py-4 lg:px-10 lg:py-6 ${slide.background}`}
                >
                  {/* Champion hero image background (only for champions slide when hovering) */}
                  {isChampionsSlide && championImage && (
                    <div
                      className="pointer-events-none absolute inset-0 bg-cover bg-center transition-opacity duration-500"
                      style={{
                        backgroundImage: `url(${championImage})`,
                        opacity: 0.25,
                      }}
                    />
                  )}
                  
                  {/* Default video background */}
                  {slide.video && (
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      loop
                      muted
                      playsInline
                      className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        isChampionsSlide && championImage ? "opacity-0" : "opacity-30"
                      }`}
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


