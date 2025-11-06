import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import mockRecapData from "@/data/mockRecapData.json";

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

  const topChampion = recapData.topChampions[0];
  const secondaryChampions = recapData.topChampions.slice(1, 3);
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
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col justify-between gap-10">
      <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div
              className="h-24 w-24 rounded-sm border-2 border-[#c89b3c] bg-cover bg-center"
              style={{ backgroundImage: "url('/rift_logo.png')" }}
              aria-label="Player avatar"
            />
            <div>
              <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl">MockPlayer#NA1</p>
              <p className="mt-2 text-sm uppercase tracking-[0.3em] text-[#c89b3c]">Mid Lane Maestro</p>
            </div>
          </div>
          <p className="max-w-xl text-base text-[#d1c6ac]">{primaryTagline}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-sm border border-[#273241] bg-[#0b1426]/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#a09b8c]">Season Record</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {wins} - {losses}
              </p>
              <p className="mt-1 text-sm text-[#a09b8c]">
                {winRate}% win rate over {totalGames.toLocaleString()} games
              </p>
            </div>
            <div className="rounded-sm border border-[#273241] bg-[#0b1426]/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#a09b8c]">LP Journey</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {netLp >= 0 ? "+" : ""}
                {netLp}
              </p>
              <p className="mt-1 text-sm text-[#a09b8c]">
                Gained {lpGained} LP · Lost {lpLost} LP
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-sm border border-[#273241] bg-[#0b1426]/70 p-6 shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold text-[#c89b3c]">Season Snapshot</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {statSummary.map((stat) => (
              <div
                key={stat.label}
                className="rounded-sm border-t-2 border-[#785a28] bg-[#0f1a2f]/80 p-4"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-[#a09b8c]">{stat.label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-[#273241] pt-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#c89b3c]">Season Motto</p>
          <p className="mt-3 text-3xl font-bold text-white">Calculated Playmaker</p>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#a09b8c]">
          Use the arrow keys or navigation below to explore your recap
        </p>
      </div>
    </div>
  );

  const championsSlide: ReactNode = (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col gap-10">
      <div className="grid flex-1 gap-10 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          {topChampion && (
            <div className="rounded-sm border border-[#273241] bg-[#0b1426]/70 p-6 shadow-md shadow-black/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-[#c89b3c]">Signature Champion</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-[#a09b8c]">Main</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-white">{topChampion.name}</p>
              <p className="mt-2 text-sm text-[#d1c6ac]">
                Your playmaking revolves around {topChampion.name}, dictating tempo and setting up the mid-game.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-semibold text-[#c89b3c]">{topChampion.games}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#a09b8c]">Games</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-[#c89b3c]">{topChampion.winrate.toFixed(1)}%</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#a09b8c]">Win Rate</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-[#c89b3c]">{topChampion.kda.toFixed(1)}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#a09b8c]">KDA</p>
                </div>
              </div>
            </div>
          )}
          {secondaryChampions.length > 0 && (
            <div className="rounded-sm border border-[#273241] bg-[#0b1426]/60 p-6">
              <h3 className="text-lg font-semibold text-[#c89b3c]">Trusted Picks</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {secondaryChampions.map((champion) => (
                  <div
                    key={champion.name}
                    className="flex items-center justify-between rounded-sm bg-[#091222]/80 p-3"
                  >
                    <div>
                      <p className="font-semibold text-white">{champion.name}</p>
                      <p className="text-xs text-[#a09b8c]">{champion.games} games</p>
                    </div>
                    <div className="text-right text-xs text-[#d1c6ac]">
                      <p className="font-semibold text-[#c89b3c]">{champion.winrate.toFixed(1)}% WR</p>
                      <p>{champion.kda.toFixed(1)} KDA</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="rounded-sm border border-[#273241] bg-[#0b1426]/70 p-6">
            <h3 className="text-lg font-semibold text-[#c89b3c]">Hidden Gem</h3>
            <p className="mt-3 text-2xl font-bold text-white">{hiddenGem.champion}</p>
            <p className="mt-2 text-sm text-[#d1c6ac]">
              Outperforming the ladder by {hiddenGem.differential.toFixed(1)}% win rate differential across {hiddenGem.games} games.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#a09b8c]">Your Win Rate</span>
                <span className="font-semibold text-white">{hiddenGem.yourWinrate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a09b8c]">Ladder Average</span>
                <span className="font-semibold text-white">{hiddenGem.pubWinrate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="rounded-sm border border-[#273241] bg-[#0b1426]/60 p-6">
            <h3 className="text-lg font-semibold text-[#c89b3c]">Role Identity</h3>
            <p className="mt-2 text-sm text-[#d1c6ac]">
              Mid lane remains your command center. You're most comfortable controlling tempo and rotations from the center of the map.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[#f0e6d2]">
              <li className="flex items-center justify-between">
                <span>Total Ranked Games</span>
                <span>{totalGames.toLocaleString()}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Peak Rank</span>
                <span>{peakRank}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Current Rank</span>
                <span>{currentRank}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="rounded-sm border border-[#273241] bg-[#0b1426]/60 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#c89b3c]">Quick Highlights</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {funFacts.slice(0, 3).map((fact) => (
            <span
              key={fact}
              className="rounded-full border border-[#785a28] px-3 py-2 text-xs text-[#d1c6ac]"
            >
              {fact}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const personalitySlide: ReactNode = (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col gap-10">
      <div className="grid flex-1 gap-10 lg:grid-cols-[1fr,1fr]">
        <div className="rounded-sm border border-[#273241] bg-[#0b1426]/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#c89b3c]">AI Personality Read</p>
          <p className="mt-3 text-2xl font-bold text-white">Calculated Risk-Taker</p>
          <p className="mt-3 text-sm text-[#d1c6ac]">{primaryTagline}</p>
          <div className="mt-6 space-y-5">
            {traitEntries.map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between text-sm font-medium text-white">
                  <span>{traitLabels[key]}</span>
                  <span>{value}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-[#091222]">
                  <div
                    className="h-2 rounded-full bg-[#c89b3c]"
                    style={{ width: `${Math.min(value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-sm border border-[#273241] bg-[#0b1426]/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#c89b3c]">Standout Achievements</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex flex-col gap-2 rounded-sm border-t-2 border-[#785a28] bg-[#091222]/80 p-4"
              >
                <p className="text-lg font-semibold text-white">{achievement.title}</p>
                <p className="text-sm text-[#d1c6ac]">{achievement.description}</p>
                <p className="text-xs italic text-[#a09b8c]">{achievement.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="rounded-sm border border-[#273241] bg-[#0b1426]/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#c89b3c]">Fun Facts</p>
          <ul className="mt-4 space-y-3 text-sm text-[#f0e6d2]">
            {funFacts.map((fact) => (
              <li key={fact} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#c89b3c]" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-sm border border-[#273241] bg-[#0b1426]/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#c89b3c]">Embarrassing Moments</p>
          <ul className="mt-4 space-y-4 text-sm text-[#f0e6d2]">
            {embarrassingMoments.map((moment) => (
              <li key={moment.title}>
                <p className="font-semibold text-white">{moment.title}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-[#a09b8c]">
                  Severity: {moment.severity}
                </p>
                <p className="mt-2 text-xs text-[#d1c6ac]">{moment.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const timelineSlide: ReactNode = (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col gap-10">
      <div className="grid flex-1 gap-10 xl:grid-cols-[1.2fr,0.8fr]">
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
        <div className="space-y-6">
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
      label: "Season Overview",
      background: "bg-gradient-to-br from-[#0a1428] via-[#111c32] to-[#1a2336]",
      content: overviewSlide,
    },
    {
      id: "champions",
      label: "Champion Mastery",
      background: "bg-gradient-to-br from-[#0a1428] via-[#1b2a3a] to-[#132238]",
      content: championsSlide,
    },
    {
      id: "personality",
      label: "Playstyle & Highlights",
      background: "bg-gradient-to-br from-[#0a1428] via-[#161f33] to-[#1c2a3f]",
      content: personalitySlide,
    },
    {
      id: "timeline",
      label: "Season Journey",
      background: "bg-gradient-to-br from-[#0a1428] via-[#122036] to-[#1a2f46]",
      content: timelineSlide,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = slides.length;

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
    <div className="min-h-screen bg-[#050b16] text-[#f0e6d2]">
      <div className="relative flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-[#785a28] px-6 py-5 sm:px-10">
          <div className="flex items-center gap-4 text-[#c89b3c]">
            <div className="h-8 w-8">
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
              <p className="text-xs font-semibold uppercase tracking-[0.3em]">Rift Rewind</p>
              <h1 className="text-xl font-bold uppercase tracking-[0.2em]">Season 2025</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-sm border border-[#785a28] px-4 py-2 text-sm font-semibold text-[#f0e6d2] transition-colors hover:bg-[#1b2a3a]"
            >
              Start New
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-sm bg-[#c89b3c] px-4 py-2 text-sm font-semibold text-[#0a1428] transition-colors hover:bg-[#d8ac4d]"
            >
              Share Recap
            </button>
            <div
              className="h-12 w-12 rounded-sm border-2 border-[#c89b3c] bg-cover bg-center"
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
            {slides.map((slide) => (
              <section
                key={slide.id}
                className={`relative flex min-h-full min-w-full flex-col px-6 py-10 text-[#f0e6d2] sm:px-10 lg:px-16 ${slide.background}`}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 20%, rgba(200, 155, 60, 0.2), transparent 55%), radial-gradient(circle at 80% 10%, rgba(17, 28, 50, 0.6), transparent 50%)",
                  }}
                />
                <div className="relative z-[1] flex h-full flex-col">{slide.content}</div>
              </section>
            ))}
          </div>
        </main>

        <div className="border-t border-[#273241] bg-[#050b16] px-6 py-4 sm:px-10">
          <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to ${slide.label}`}
                  aria-current={index === currentSlide ? "page" : undefined}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentSlide ? "w-12 bg-[#c89b3c]" : "w-8 bg-[#2c3542] hover:bg-[#3a4658]"
                  }`}
                  onClick={() => goToIndex(index)}
                />
              ))}
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#a09b8c]">
              {slides[currentSlide]?.label}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                className="rounded-sm border border-[#785a28] px-4 py-2 text-sm font-semibold text-[#f0e6d2] transition-colors hover:bg-[#1b2a3a]"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={goNext}
                className="rounded-sm bg-[#c89b3c] px-4 py-2 text-sm font-semibold text-[#0a1428] transition-colors hover:bg-[#d8ac4d]"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <footer className="border-t border-[#785a28] bg-[#050b16] py-8">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-2 px-4 text-center text-xs text-[#a09b8c]">
            <span className="tracking-[0.3em] uppercase text-[#c89b3c]">Rift Rewind</span>
            <p>League of Legends · Season 2025 Recap</p>
          </div>
        </footer>
      </div>
    </div>
  );
}


