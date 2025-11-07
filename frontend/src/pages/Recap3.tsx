import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import newMockRecapData from "@/data/newMockDataRecap.json";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface RecapData {
  message: {
    wrapped: {
      unique_id: string;
      wrapped_data: {
        wrapped: {
          tagline: string;
          summary: string;
          archetype: string;
        };
        stats: {
          games: number;
          winrate: number;
          hours: number;
          peakTime: string;
          bestMonth: string;
        };
        highlights: Array<{
          title: string;
          description: string;
          flavor: string;
          label: string;
          percentile?: string;
          icon?: string;
        }>;
        champions: {
          main: {
      name: string;
      games: number;
      winrate: number;
      kda: number;
      insight: string;
    };
          top3: Array<{
      name: string;
      games: number;
      wr: number;
    }>;
          hiddenGem: {
      name: string;
      games: number;
      winrate: number;
      insight: string;
          } | null;
        };
        playstyle: {
          summary: string;
          traits: {
            aggression: number;
            teamwork: number;
            mechanics: number;
            strategy: number;
            consistency: number;
          };
        };
        memorable: {
          bestStreak: number;
          clutchestComeback: string;
          bestMonth: string;
        };
        funFacts: string[];
        closing: {
          message: string;
          year: string;
        };
      };
  };
  timeline: Array<{
    id: string;
      kda: number;
      champ: string;
      win: boolean;
    description: string;
    }>;
  };
}

type SlideDescriptor = {
  id: string;
  label: string;
  background: string;
  video?: string;
  content: ReactNode;
};

const traitLabels: Record<string, string> = {
  aggression: "Aggression",
  teamwork: "Teamwork",
  mechanics: "Mechanics",
  strategy: "Strategy",
  consistency: "Consistency",
};

export default function Recap3() {
  const navigate = useNavigate();
  const recapData = newMockRecapData as RecapData;

  // Extract data from new structure
  const wrappedData = recapData.message.wrapped.wrapped_data;
  const {
    games: totalGames,
    winrate,
    hours,
    peakTime,
    bestMonth,
  } = wrappedData.stats;

  const { tagline, summary, archetype } = wrappedData.wrapped;
  const wins = Math.round((winrate / 100) * totalGames);
  const losses = totalGames - wins;

  const statSummary = [
    { label: "Total Games", value: totalGames.toLocaleString() },
    { label: "Win Rate", value: `${winrate.toFixed(1)}%` },
    { label: "Hours Played", value: `${hours}h` },
    { label: "Peak Time", value: peakTime },
    { label: "Best Month", value: bestMonth },
    { label: "Archetype", value: archetype },
  ];

  // Champions data
  const championsData = wrappedData.champions;
  const topChampions = championsData.top3.map(champ => ({ 
    name: champ.name, 
    games: champ.games, 
    winrate: champ.wr, 
    kda: 0 
  }));
  
  const hiddenGem = championsData.hiddenGem 
    ? {
        champion: championsData.hiddenGem.name,
        yourWinrate: championsData.hiddenGem.winrate,
        games: championsData.hiddenGem.games,
        insight: championsData.hiddenGem.insight,
      }
    : null;

  const mainChampion = championsData.main;

  // Timeline data - sort by date (most recent first based on ID)
  const timelineMatches = [...recapData.message.timeline].sort((a, b) => {
    // Extract numeric part from ID (e.g., "KR_7858151244" -> 7858151244)
    const aNum = parseInt(a.id.split('_')[1]);
    const bNum = parseInt(b.id.split('_')[1]);
    return bNum - aNum; // Descending order (most recent first)
  });

  const funFacts = wrappedData.funFacts;
  const highlights = wrappedData.highlights.slice(0, 4);
  
  const traitEntries = Object.entries(wrappedData.playstyle.traits) as Array<[string, number]>;
  const primaryTagline = wrappedData.playstyle.summary;

  // State declarations
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImages, setHeroImages] = useState<Array<{ name: string; image: string }>>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

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

  const handleShareToX = useCallback(() => {
    const text = `Just reviewed my League of Legends Season ${wrappedData.closing.year}! 🎮\n\n${winrate.toFixed(1)}% WR across ${totalGames} games\n${archetype}\n\nCheck out my #RiftRewind`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }, [wrappedData.closing.year, winrate, totalGames, archetype]);

  const handleShareToFacebook = useCallback(() => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  }, []);

  const handleShareToReddit = useCallback(() => {
    const title = `My League of Legends Season ${wrappedData.closing.year} Recap - ${archetype}`;
    const url = window.location.href;
    window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
  }, [wrappedData.closing.year, archetype]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.warn("Failed to copy link", error);
    }
  }, []);

  const handleDownloadImage = useCallback(() => {
    // Placeholder for future screenshot functionality
    console.info("Download image functionality - to be implemented");
    alert("Screenshot download coming soon! For now, use your device's screenshot feature.");
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
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">{recapData.message.wrapped.unique_id}</p>
          <p className="mt-1 text-sm uppercase tracking-[0.3em] text-[#c89b3c] sm:mt-2 sm:text-base">Season {wrappedData.closing.year}</p>
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
        <p className="text-xs uppercase tracking-[0.3em] text-[#c89b3c]">{tagline}</p>
        <p className="mt-2 text-lg text-[#d1c6ac] sm:text-xl">{summary}</p>
      </div>
    </div>
  );

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

          {/* MEMORABLE STATS Section */}
          <div className="rounded-sm border border-[#c89b3c]/50 bg-[#0b1426]/95 p-4 sm:p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c89b3c]/70 sm:text-xs">MEMORABLE</p>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between border-b border-[#273241] pb-2">
                <span className="text-xs text-[#a09b8c]">Best Streak</span>
                <span className="text-2xl font-bold text-[#4caf50]">{wrappedData.memorable.bestStreak}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#273241] pb-2">
                <span className="text-xs text-[#a09b8c]">Total Hours</span>
                <span className="text-xl font-bold text-[#c89b3c]">{hours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#a09b8c]">Peak Time</span>
                <span className="text-base font-semibold text-white">{peakTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const personalitySlide: ReactNode = (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col justify-center gap-3 sm:gap-4">
      {/* Top Row: Season Highlights */}
      <div className="rounded-sm border-2 border-[#785a28] bg-[#0b1426]/90 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] sm:text-sm">Season Highlights</p>
        <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-2">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="rounded-sm border-l-4 border-[#c89b3c] bg-[#091222]/80 p-4"
            >
              <div className="flex items-start gap-3">
                {highlight.icon && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-[#050b16]">
                    {getChampionImage(highlight.icon) ? (
                      <img
                        src={getChampionImage(highlight.icon)}
                        alt={highlight.icon}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a2336] to-[#0a1428]">
                        <span className="text-base font-bold text-[#c89b3c]">{highlight.icon.charAt(0)}</span>
                  </div>
                    )}
                </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold text-white sm:text-base">{highlight.title}</p>
                  {highlight.percentile && (
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#c89b3c]">
                      {highlight.percentile}
                    </p>
                  )}
                  <p className="mt-2 text-xs leading-relaxed text-[#d1c6ac]">{highlight.description}</p>
                  <p className="mt-2 text-xs italic text-[#a09b8c]">"{highlight.flavor}"</p>
              </div>
          </div>
              </div>
            ))}
        </div>
      </div>

      {/* Bottom Row: AI Personality Radar & Fun Facts */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        {/* AI Personality Radar Chart */}
        <div className="rounded-sm border-2 border-[#785a28] bg-[#0b1426]/90 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] sm:text-sm">Playstyle Analysis</p>
          <p className="mt-2 text-xl font-bold text-white sm:text-2xl">{archetype}</p>
          <p className="mt-2 text-xs leading-relaxed text-[#d1c6ac] sm:text-sm">{primaryTagline}</p>
          
          <div className="mt-3 flex items-center justify-center sm:mt-4">
            <ChartContainer
              config={{
                value: {
                  label: "Score",
                  color: "#c89b3c",
                },
              }}
              className="mx-auto aspect-square max-h-[250px] w-full"
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
            {funFacts.slice(0, 4).map((fact, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#785a28] text-[10px] font-bold text-white sm:h-6 sm:w-6 sm:text-xs">
                  {index + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const timelineSlide: ReactNode = (
    <div className="relative h-full w-full overflow-hidden">
      {/* Header - Compact at top */}
      <div className="absolute left-0 right-0 top-6 z-20 text-center sm:top-8">
        <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-[#c89b3c] sm:text-2xl">
          Your Greatest Moments
        </h2>
        <p className="mt-1 text-xs text-[#d1c6ac] sm:text-sm">
          {activeMatchIndex + 1} / {timelineMatches.length}
        </p>
      </div>

      {/* Carousel Container - Perfect Center of viewport */}
      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center" style={{ perspective: "2000px" }}>
        <div className="relative">
          {timelineMatches.map((match, index) => {
            const championImage = getChampionImage(match.champ);
            
            // Calculate position relative to active card
            let position = index - activeMatchIndex;
            
            // Wrap around for seamless loop
            if (position > timelineMatches.length / 2) {
              position -= timelineMatches.length;
            } else if (position < -timelineMatches.length / 2) {
              position += timelineMatches.length;
            }

            const isActive = position === 0;
            const isVisible = Math.abs(position) <= 2;
            
            // Calculate transformations - center the card first, then offset
            const translateX = position * 350;
            const scale = isActive ? 1 : Math.max(0.7, 1 - Math.abs(position) * 0.15);
            const opacity = isActive ? 1 : Math.max(0.4, 1 - Math.abs(position) * 0.25);
            const rotateY = position * 20;
            const zIndex = isActive ? 50 : 40 - Math.abs(position);
            
            return (
              <div
                key={match.id}
                onClick={() => setActiveMatchIndex(index)}
                className={`absolute left-1/2 top-1/2 h-[500px] w-[340px] cursor-pointer overflow-hidden rounded-lg transition-all duration-500 ease-out sm:h-[540px] sm:w-[360px] ${
                  match.win 
                    ? 'border-2 border-[#4caf50]/50 bg-[#0b1426]/95 shadow-2xl' 
                    : 'border-2 border-[#f44336]/50 bg-[#1a0b0e]/95 shadow-2xl'
                } ${isActive ? 'hover:border-[#c89b3c]' : ''}`}
                style={{
                  transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                  opacity: isVisible ? opacity : 0,
                  zIndex,
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
              >
                {/* Win/Loss Badge */}
                <div className="absolute right-3 top-3 z-10">
                  <div
                    className={`rounded-sm px-2 py-1 text-xs font-bold uppercase ${
                      match.win
                        ? 'border border-[#4caf50]/40 bg-[#4caf50]/20 text-[#4caf50]'
                        : 'border border-[#f44336]/40 bg-[#f44336]/20 text-[#f44336]'
                    }`}
                  >
                    {match.win ? 'Victory' : 'Defeat'}
                  </div>
                </div>

                {/* Champion Image */}
                <div className="relative h-[300px] overflow-hidden bg-[#050b16] sm:h-[330px]">
                  {championImage ? (
                    <img
                      src={championImage}
                      alt={match.champ}
                      className="h-full w-full object-cover object-center"
                      draggable="false"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a2336] to-[#0a1428]">
                      <span className="text-6xl font-bold text-[#c89b3c] sm:text-7xl">
                        {match.champ.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1428] via-transparent to-transparent opacity-60" />
                  
                  {/* Champion Name */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xl font-bold text-white drop-shadow-lg sm:text-2xl">
                      {match.champ}
                    </p>
                  </div>
                </div>

                {/* Match Details */}
                <div className="flex flex-col gap-2 border-t border-[#785a28]/30 bg-[#0a1428]/60 p-4">
                  {/* KDA */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#a09b8c]">KDA</span>
                    <span className="text-2xl font-bold text-[#c89b3c]">{match.kda.toFixed(2)}</span>
                  </div>

                  {/* Description */}
                  <p className="line-clamp-3 text-xs leading-relaxed text-[#d1c6ac]">
                    {match.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute left-0 top-1/2 z-[60] flex w-full -translate-y-1/2 items-center justify-between px-4 sm:px-8">
        <button
          type="button"
          onClick={() => setActiveMatchIndex((prev) => (prev - 1 + timelineMatches.length) % timelineMatches.length)}
          className="rounded-full border-2 border-[#785a28] bg-[#0a1428]/90 p-3 backdrop-blur-sm transition-all hover:border-[#c89b3c] hover:bg-[#1b2a3a] hover:scale-110"
          aria-label="Previous match"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c89b3c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setActiveMatchIndex((prev) => (prev + 1) % timelineMatches.length)}
          className="rounded-full border-2 border-[#785a28] bg-[#0a1428]/90 p-3 backdrop-blur-sm transition-all hover:border-[#c89b3c] hover:bg-[#1b2a3a] hover:scale-110"
          aria-label="Next match"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c89b3c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-12">
        {timelineMatches.slice(0, 10).map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveMatchIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === activeMatchIndex ? 'w-8 bg-[#c89b3c]' : 'w-2 bg-[#2c3542] hover:bg-[#3a4658]'
            }`}
          />
        ))}
      </div>
    </div>
  );

  const shareSlide: ReactNode = (
    <div className="mx-auto flex h-full w-full max-w-[1000px] flex-col justify-center gap-6 sm:gap-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold uppercase tracking-[0.2em] text-[#c89b3c] sm:text-4xl">
          Share Your Journey
        </h2>
        <p className="mt-2 text-sm text-[#d1c6ac] sm:text-base">
          Show off your Season {wrappedData.closing.year} achievements
        </p>
      </div>

      {/* Compact Stats Card */}
      <div className="rounded-sm border-2 border-[#785a28] bg-[#0b1426]/95 p-6 shadow-2xl sm:p-8">
        {/* Player Header */}
        <div className="mb-6 flex items-center gap-4 border-b border-[#785a28] pb-4">
          <div
            className="h-16 w-16 shrink-0 rounded-sm border-2 border-[#c89b3c] bg-cover bg-center sm:h-20 sm:w-20"
            style={{ backgroundImage: "url('/rift_logo.png')" }}
            aria-label="Player avatar"
          />
          <div>
            <p className="text-2xl font-bold text-white sm:text-3xl">{recapData.message.wrapped.unique_id}</p>
            <p className="text-sm uppercase tracking-[0.2em] text-[#c89b3c]">{archetype}</p>
          </div>
        </div>

        {/* Stats Grid - Compact */}
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {/* Games & Winrate */}
          <div className="rounded-sm bg-[#091222]/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#a09b8c]">Performance</p>
            <div className="mt-2 space-y-1">
              <p className="text-2xl font-bold text-white">{totalGames}</p>
              <p className="text-xs text-[#d1c6ac]">Games Played</p>
              <p className="mt-2 text-xl font-bold text-[#c89b3c]">{winrate.toFixed(1)}%</p>
              <p className="text-xs text-[#d1c6ac]">Win Rate</p>
            </div>
          </div>

          {/* Top Champions */}
          <div className="rounded-sm bg-[#091222]/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#a09b8c]">Top Champions</p>
            <div className="mt-2 space-y-2">
              {topChampions.slice(0, 3).map((champ, idx) => (
                <div key={champ.name} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#785a28] text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-white">{champ.name}</span>
                  <span className="ml-auto text-xs text-[#c89b3c]">{champ.winrate.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Season Highlights */}
          <div className="rounded-sm bg-[#091222]/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#a09b8c]">Highlights</p>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#d1c6ac]">Best Streak</span>
                <span className="text-lg font-bold text-[#4caf50]">{wrappedData.memorable.bestStreak}</span>
          </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#d1c6ac]">Hours</span>
                <span className="text-lg font-bold text-[#c89b3c]">{hours}h</span>
        </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#d1c6ac]">Peak Time</span>
                <span className="text-sm font-semibold text-white">{peakTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Champion Showcase */}
        {mainChampion && (
          <div className="mt-4 rounded-sm border border-[#c89b3c]/30 bg-[#0a1428]/60 p-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[#050b16]">
                {getChampionImage(mainChampion.name) ? (
                  <img
                    src={getChampionImage(mainChampion.name)}
                    alt={mainChampion.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a2336] to-[#0a1428]">
                    <span className="text-xl font-bold text-[#c89b3c]">{mainChampion.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-[#c89b3c]">Main Champion</p>
                <p className="text-xl font-bold text-white">{mainChampion.name}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-[#a09b8c]">
                  <span>{mainChampion.winrate.toFixed(1)}% WR</span>
                  <span>•</span>
                  <span>{mainChampion.games} Games</span>
                  <span>•</span>
                  <span>{mainChampion.kda.toFixed(2)} KDA</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Buttons */}
      <div className="space-y-4">
        <p className="text-center text-sm uppercase tracking-[0.2em] text-[#c89b3c]">Share On</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* X/Twitter */}
          <button
            type="button"
            onClick={handleShareToX}
            className="group flex items-center justify-center gap-2 rounded-sm border border-[#1DA1F2]/50 bg-[#1DA1F2]/10 px-4 py-3 transition-all hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1DA1F2">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-sm font-semibold text-white">X</span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={handleShareToFacebook}
            className="group flex items-center justify-center gap-2 rounded-sm border border-[#1877F2]/50 bg-[#1877F2]/10 px-4 py-3 transition-all hover:bg-[#1877F2]/20 hover:border-[#1877F2]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-sm font-semibold text-white">Facebook</span>
          </button>

          {/* Reddit */}
          <button
            type="button"
            onClick={handleShareToReddit}
            className="group flex items-center justify-center gap-2 rounded-sm border border-[#FF4500]/50 bg-[#FF4500]/10 px-4 py-3 transition-all hover:bg-[#FF4500]/20 hover:border-[#FF4500]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#FF4500">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
            </svg>
            <span className="text-sm font-semibold text-white">Reddit</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`group flex items-center justify-center gap-2 rounded-sm border px-4 py-3 transition-all ${
              linkCopied
                ? 'border-[#4caf50] bg-[#4caf50]/20'
                : 'border-[#c89b3c]/50 bg-[#c89b3c]/10 hover:bg-[#c89b3c]/20 hover:border-[#c89b3c]'
            }`}
          >
            {linkCopied ? (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span className="text-sm font-semibold text-[#4caf50]">Copied!</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="#c89b3c" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <span className="text-sm font-semibold text-white">Copy Link</span>
              </>
            )}
          </button>

          {/* Download Image */}
          <button
            type="button"
            onClick={handleDownloadImage}
            className="group flex items-center justify-center gap-2 rounded-sm border border-[#4caf50]/50 bg-[#4caf50]/10 px-4 py-3 transition-all hover:bg-[#4caf50]/20 hover:border-[#4caf50]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span className="text-sm font-semibold text-white">Download</span>
          </button>
        </div>
      </div>

      {/* Footer Message */}
      <div className="text-center">
        <p className="text-xs text-[#a09b8c]">
          Thanks for playing! See you on the Rift in Season {parseInt(wrappedData.closing.year) + 1}
        </p>
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
      label: "Champions",
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
      label: "Greatest Moments",
      background: "bg-gradient-to-br from-[#0a1428] via-[#122036] to-[#1a2f46]",
      video: "/4.webm",
      content: timelineSlide,
    },
    {
      id: "share",
      label: "Share",
      background: "bg-gradient-to-br from-[#0a1428] via-[#1a1f32] to-[#1e2a3d]",
      video: "/animated-zaun.webm",
      content: shareSlide,
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

  // Keyboard navigation for timeline carousel
  useEffect(() => {
    if (currentSlide !== 3) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveMatchIndex((prev) => (prev - 1 + timelineMatches.length) % timelineMatches.length);
      } else if (e.key === 'ArrowRight') {
        setActiveMatchIndex((prev) => (prev + 1) % timelineMatches.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, timelineMatches.length]);

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


