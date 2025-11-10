import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface ComparisonData {
  comparison_title: string;
  overall_summary: string;
  statistical_comparison: Array<{
    category: string;
    player1_value: string;
    player2_value: string;
    winner: string;
    insight: string;
  }>;
  playstyle_comparison: {
    summary: string;
    player1_strengths: string[];
    player2_strengths: string[];
  };
  champion_comparison: {
    summary: string;
    common_picks?: string[];
    unique_player1?: string[];
    unique_player2?: string[];
  };
  key_differences: string[];
  verdict: {
    winner: string;
    reasoning: string;
    closing_statement: string;
  };
}

interface PlayerWrapped {
  name: string;
  region: string;
  wrapped: {
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
      };
    };
  };
}

interface CompareResponse {
  message: {
    player1: PlayerWrapped;
    player2: PlayerWrapped;
    comparison: ComparisonData;
  };
}

type SlideDescriptor = {
  id: string;
  label: string;
  background: string;
  video?: string;
  content: ReactNode;
};

export default function Compare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summonerIcon1, setSummonerIcon1] = useState<string | null>(null);
  const [summonerIcon2, setSummonerIcon2] = useState<string | null>(null);
  
  // Slide navigation state
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const name1 = searchParams.get("name1");
    const tag1 = searchParams.get("tag1");
    const region1 = searchParams.get("region1");
    const name2 = searchParams.get("name2");
    const tag2 = searchParams.get("tag2");
    const region2 = searchParams.get("region2");
    const testMode = searchParams.get("test") === "true";

    if (!name1 || !tag1 || !region1 || !name2 || !tag2 || !region2) {
      navigate("/");
      return;
    }

    const fetchCompareData = async () => {
      try {
        setIsLoading(true);
        // Empty string means use relative URL (for production with nginx proxy)
        const backendUrl = import.meta.env.VITE_BACKEND_URL === undefined ? "http://localhost:9000" : import.meta.env.VITE_BACKEND_URL;
        
        const params = new URLSearchParams({
          name1,
          tag1,
          region1,
          name2,
          tag2,
          region2,
          test_mode: testMode.toString(),
        });

        const response = await fetch(`${backendUrl}/api/compareData?${params}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch comparison data");
        }

        const data = await response.json();
        setCompareData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompareData();
  }, [searchParams, navigate]);

  // Fetch summoner icons
  useEffect(() => {
    const name1 = searchParams.get("name1");
    const tag1 = searchParams.get("tag1");
    const region1 = searchParams.get("region1");
    const name2 = searchParams.get("name2");
    const tag2 = searchParams.get("tag2");
    const region2 = searchParams.get("region2");

    if (!name1 || !tag1 || !region1 || !name2 || !tag2 || !region2) {
      return;
    }

    const fetchSummonerIcons = async () => {
      try {
        // Empty string means use relative URL (for production with nginx proxy)
        const backendUrl = import.meta.env.VITE_BACKEND_URL === undefined ? 'http://localhost:9000' : import.meta.env.VITE_BACKEND_URL;
        
        // Fetch player 1 icon
        const response1 = await fetch(`${backendUrl}/api/summonerIcon?name=${encodeURIComponent(name1)}&tag=${encodeURIComponent(tag1)}&region=${encodeURIComponent(region1)}`);
        if (response1.ok) {
          const data1 = await response1.json();
          if (data1.iconUrl) setSummonerIcon1(data1.iconUrl);
        }

        // Fetch player 2 icon
        const response2 = await fetch(`${backendUrl}/api/summonerIcon?name=${encodeURIComponent(name2)}&tag=${encodeURIComponent(tag2)}&region=${encodeURIComponent(region2)}`);
        if (response2.ok) {
          const data2 = await response2.json();
          if (data2.iconUrl) setSummonerIcon2(data2.iconUrl);
        }
      } catch (err) {
        console.warn("Error fetching summoner icons:", err);
      }
    };

    fetchSummonerIcons();
  }, [searchParams]);

  // Navigation functions
  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => {
      const total = 4; // Total number of slides
      return (prev - 1 + total) % total;
    });
  }, []);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => {
      const total = 4; // Total number of slides
      return (prev + 1) % total;
    });
  }, []);

  const goToIndex = useCallback((index: number) => {
    const total = 4; // Total number of slides
    if (index < 0 || index >= total) return;
    setCurrentSlide(index);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
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
  }, [goNext, goPrev]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Scroll wheel navigation with debounce
  useEffect(() => {
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      if (isScrolling) return;
      
      isScrolling = true;
      clearTimeout(scrollTimeout);
      
      if (event.deltaY > 0) {
        goNext();
      } else if (event.deltaY < 0) {
        goPrev();
      }
      
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 800);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, [goNext, goPrev]);

  // Video management
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentSlide) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, [currentSlide, compareData, isLoading]);

  if (isLoading) {
    const name1 = searchParams.get("name1") || "Player 1";
    const tag1 = searchParams.get("tag1") || "";
    const name2 = searchParams.get("name2") || "Player 2";
    const tag2 = searchParams.get("tag2") || "";
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1428] via-[#111c32] to-[#1a2336] flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c89b3c]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c89b3c]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Loading content */}
        <div className="relative z-10 text-center space-y-8 px-4">
          {/* Hexagon spinner */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 animate-spin">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c89b3c" />
                    <stop offset="100%" stopColor="#d8ac4d" />
                  </linearGradient>
                </defs>
                <polygon
                  points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                  fill="none"
                  stroke="url(#goldGradient)"
                  strokeWidth="3"
                />
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#c89b3c] to-[#d8ac4d] rounded-full animate-pulse" />
            </div>
          </div>

          {/* Loading text */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#c89b3c] to-[#d8ac4d] bg-clip-text text-transparent">
              Comparing Players
            </h2>
            <div className="space-y-2">
              <p className="text-[#a09b8c] animate-pulse" style={{ animationDelay: '0s' }}>
                Analyzing {name1}#{tag1} vs {name2}#{tag2}...
              </p>
              <p className="text-[#a09b8c] animate-pulse" style={{ animationDelay: '0.5s' }}>
                Comparing playstyle metrics...
              </p>
              <p className="text-[#a09b8c] animate-pulse" style={{ animationDelay: '1s' }}>
                Generating comparison insights...
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-64 mx-auto">
            <div className="h-1 bg-[#785a28] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#c89b3c] to-[#d8ac4d] animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !compareData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1428] via-[#1a1f32] to-[#1e2a3d] flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-2xl space-y-6 px-4 text-center">
          {/* Error Icon */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
                <polygon
                  points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                  fill="none"
                  stroke="url(#errorGradient)"
                  strokeWidth="3"
                />
                <line x1="35" y1="35" x2="65" y2="65" stroke="url(#errorGradient)" strokeWidth="4" strokeLinecap="round" />
                <line x1="65" y1="35" x2="35" y2="65" stroke="url(#errorGradient)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-[#c89b3c] sm:text-4xl">
              Unable to Load Comparison
            </h2>
            <div className="rounded-sm border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-base text-red-400 sm:text-lg">
                {error || "Failed to load comparison data. Please try again."}
              </p>
            </div>
            <p className="text-sm text-[#a09b8c]">
              This could be due to:
            </p>
            <ul className="text-left text-sm text-[#d1c6ac] space-y-2 max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-[#c89b3c] mt-1">•</span>
                <span>Invalid summoner names or tags</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c89b3c] mt-1">•</span>
                <span>Region mismatch or API unavailability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c89b3c] mt-1">•</span>
                <span>Insufficient match history data for one or both players</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => window.location.reload()}
              className="rounded-sm border-2 border-[#785a28] bg-transparent px-6 py-3 font-semibold text-[#c89b3c] transition-all hover:bg-[#785a28]/20 hover:border-[#c89b3c]"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="rounded-sm border-2 border-[#c89b3c] bg-[#c89b3c] px-6 py-3 font-semibold text-[#0a1428] transition-all hover:bg-[#d8ac4d] hover:border-[#d8ac4d]"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { player1, player2, comparison } = compareData.message;
  const p1Data = player1.wrapped.wrapped.wrapped_data;
  const p2Data = player2.wrapped.wrapped.wrapped_data;

  // Slide 1: Overview - Head to Head
  const overviewSlide: ReactNode = (
    <div className="mx-auto w-full max-w-7xl h-full flex flex-col justify-center">
      {/* Title */}
      <div className="text-center mb-4 lg:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#c89b3c] mb-2">
          {comparison.comparison_title}
        </h1>
        <p className="text-sm sm:text-base text-[#d1c6ac] max-w-3xl mx-auto px-4">
          {comparison.overall_summary}
        </p>
      </div>

      {/* Player Cards Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Player 1 - RED */}
          <div className="relative overflow-hidden bg-[#0b1426]/90 border-2 border-[#ef4444]/50 rounded-lg hover:border-[#ef4444] transition-colors">
            {/* Red accent bar */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ef4444]" />
            
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded border-2 border-[#ef4444] bg-cover bg-center shadow-lg shadow-[#ef4444]/20"
                  style={{ backgroundImage: `url('${summonerIcon1 || '/rift_logo.png'}')` }}
                  aria-label={summonerIcon1 ? "Player 1 summoner icon" : "Default icon"}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{player1.name}</h2>
                  <p className="text-xs sm:text-sm uppercase tracking-wider text-[#ef4444]">{p1Data.wrapped.archetype}</p>
                </div>
              </div>
              
              <p className="text-sm text-[#d1c6ac] mb-4">{p1Data.wrapped.tagline}</p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0a1428]/60 p-3 rounded border-l-2 border-[#ef4444]">
                  <p className="text-xs text-[#a09b8c] mb-1">Games Played</p>
                  <p className="text-2xl font-bold text-white">{p1Data.stats.games}</p>
                </div>
                <div className="bg-[#0a1428]/60 p-3 rounded border-l-2 border-[#ef4444]">
                  <p className="text-xs text-[#a09b8c] mb-1">Win Rate</p>
                  <p className="text-2xl font-bold text-[#ef4444]">{p1Data.stats.winrate.toFixed(1)}%</p>
                </div>
                <div className="bg-[#0a1428]/60 p-3 rounded border-l-2 border-[#ef4444]">
                  <p className="text-xs text-[#a09b8c] mb-1">Time Played</p>
                  <p className="text-xl font-bold text-white">{p1Data.stats.hours}h</p>
                </div>
                <div className="bg-[#0a1428]/60 p-3 rounded border-l-2 border-[#ef4444]">
                  <p className="text-xs text-[#a09b8c] mb-1">Peak Time</p>
                  <p className="text-base font-bold text-white">{p1Data.stats.peakTime}</p>
                </div>
              </div>

              {/* Strengths */}
              <div className="pt-3 border-t border-[#ef4444]/30">
                <p className="text-xs uppercase tracking-wider text-[#ef4444] mb-2 font-semibold">Strengths</p>
                <div className="space-y-2">
                  {comparison.playstyle_comparison.player1_strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#ef4444] text-lg leading-none">✦</span>
                      <span className="text-xs sm:text-sm text-[#d1c6ac] flex-1">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Player 2 - BLUE */}
          <div className="relative overflow-hidden bg-[#0b1426]/90 border-2 border-[#3b82f6]/50 rounded-lg hover:border-[#3b82f6] transition-colors">
            {/* Blue accent bar */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#3b82f6]" />
            
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded border-2 border-[#3b82f6] bg-cover bg-center shadow-lg shadow-[#3b82f6]/20"
                  style={{ backgroundImage: `url('${summonerIcon2 || '/rift_logo.png'}')` }}
                  aria-label={summonerIcon2 ? "Player 2 summoner icon" : "Default icon"}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{player2.name}</h2>
                  <p className="text-xs sm:text-sm uppercase tracking-wider text-[#3b82f6]">{p2Data.wrapped.archetype}</p>
                </div>
              </div>
              
              <p className="text-sm text-[#d1c6ac] mb-4">{p2Data.wrapped.tagline}</p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0a1428]/60 p-3 rounded border-l-2 border-[#3b82f6]">
                  <p className="text-xs text-[#a09b8c] mb-1">Games Played</p>
                  <p className="text-2xl font-bold text-white">{p2Data.stats.games}</p>
                </div>
                <div className="bg-[#0a1428]/60 p-3 rounded border-l-2 border-[#3b82f6]">
                  <p className="text-xs text-[#a09b8c] mb-1">Win Rate</p>
                  <p className="text-2xl font-bold text-[#3b82f6]">{p2Data.stats.winrate.toFixed(1)}%</p>
                </div>
                <div className="bg-[#0a1428]/60 p-3 rounded border-l-2 border-[#3b82f6]">
                  <p className="text-xs text-[#a09b8c] mb-1">Time Played</p>
                  <p className="text-xl font-bold text-white">{p2Data.stats.hours}h</p>
                </div>
                <div className="bg-[#0a1428]/60 p-3 rounded border-l-2 border-[#3b82f6]">
                  <p className="text-xs text-[#a09b8c] mb-1">Peak Time</p>
                  <p className="text-base font-bold text-white">{p2Data.stats.peakTime}</p>
                </div>
              </div>

              {/* Strengths */}
              <div className="pt-3 border-t border-[#3b82f6]/30">
                <p className="text-xs uppercase tracking-wider text-[#3b82f6] mb-2 font-semibold">Strengths</p>
                <div className="space-y-2">
                  {comparison.playstyle_comparison.player2_strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#3b82f6] text-lg leading-none">✦</span>
                      <span className="text-xs sm:text-sm text-[#d1c6ac] flex-1">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );

  // Slide 2: Statistical Comparison
  const statsSlide: ReactNode = (
    <div className="mx-auto w-full max-w-6xl h-full flex flex-col justify-center py-4">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#c89b3c] mb-2">Head-to-Head</h2>
        <p className="text-xs sm:text-sm text-[#a09b8c]">Performance Metrics</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {comparison.statistical_comparison.map((stat, idx) => (
          <div key={idx} className="relative overflow-hidden bg-[#0b1426]/90 border border-[#785a28] rounded-lg hover:border-[#c89b3c] transition-all">
            {/* Winner glow effect */}
            {stat.winner && (
              <div className={`absolute top-0 left-0 w-1 h-full ${stat.winner === 'player1' ? 'bg-[#ef4444]' : 'bg-[#3b82f6]'}`} />
            )}
            
            <div className="p-3 sm:p-4">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wide">{stat.category}</h3>
              </div>
              
              {/* Comparison */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center mb-2">
                {/* Player 1 */}
                <div className={`text-right ${stat.winner === 'player1' ? 'text-[#ef4444]' : 'text-[#a09b8c]'}`}>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">{stat.player1_value}</p>
                  <p className="text-[10px] sm:text-xs text-[#a09b8c] truncate">{player1.name}</p>
                </div>
                
                {/* VS Divider */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="h-6 w-px bg-[#785a28]" />
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] text-[#785a28] font-bold">VS</span>
                  </div>
                </div>
                
                {/* Player 2 */}
                <div className={`text-left ${stat.winner === 'player2' ? 'text-[#3b82f6]' : 'text-[#a09b8c]'}`}>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">{stat.player2_value}</p>
                  <p className="text-[10px] sm:text-xs text-[#a09b8c] truncate">{player2.name}</p>
                </div>
              </div>
              
              {/* Insight */}
              <p className="text-[10px] sm:text-xs text-[#d1c6ac] leading-relaxed italic border-t border-[#785a28]/30 pt-2">
                {stat.insight}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Slide 3: Analysis & Insights (Combined playstyle, champions, and differences)
  const analysisSlide: ReactNode = (
    <div className="mx-auto w-full max-w-6xl h-full flex flex-col justify-center py-4">
      <div className="text-center mb-4 sm:mb-5">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#c89b3c] mb-2">Deep Dive</h2>
        <p className="text-xs sm:text-sm text-[#a09b8c]">Playstyle & Strategy</p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Playstyle Comparison */}
        <div className="bg-[#0b1426]/90 border border-[#785a28] rounded-lg p-3 sm:p-4 hover:border-[#c89b3c] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl sm:text-2xl">🎯</span>
            <h3 className="text-sm sm:text-base font-bold text-[#c89b3c]">Playstyle Overview</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#d1c6ac] leading-relaxed">{comparison.playstyle_comparison.summary}</p>
        </div>

        {/* Champion Pools & Key Differences Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Champion Comparison */}
          <div className="bg-[#0b1426]/90 border border-[#785a28] rounded-lg p-3 sm:p-4 hover:border-[#c89b3c] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl sm:text-2xl">⚔️</span>
              <h3 className="text-sm sm:text-base font-bold text-[#c89b3c]">Champion Pools</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#d1c6ac] mb-3 leading-relaxed">{comparison.champion_comparison.summary}</p>
            
            {comparison.champion_comparison.common_picks && comparison.champion_comparison.common_picks.length > 0 && (
              <div>
                <p className="text-[10px] sm:text-xs font-semibold text-[#a09b8c] mb-2">Common Champions</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {comparison.champion_comparison.common_picks.map((champ, idx) => (
                    <span key={idx} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#c89b3c]/10 border border-[#c89b3c]/30 rounded text-[10px] sm:text-xs text-[#c89b3c]">
                      {champ}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Key Differences */}
          <div className="bg-[#0b1426]/90 border border-[#785a28] rounded-lg p-3 sm:p-4 hover:border-[#c89b3c] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl sm:text-2xl">🔍</span>
              <h3 className="text-sm sm:text-base font-bold text-[#c89b3c]">Key Differences</h3>
            </div>
            <div className="space-y-2">
              {comparison.key_differences.map((diff, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#c89b3c] text-base sm:text-lg leading-none shrink-0">✦</span>
                  <span className="text-xs sm:text-sm text-[#d1c6ac] leading-relaxed">{diff}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Slide 4: The Verdict
  const verdictSlide: ReactNode = (
    <div className="mx-auto w-full max-w-4xl h-full flex flex-col justify-center py-4">
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-block mb-2 sm:mb-3">
          <span className="text-4xl sm:text-5xl md:text-6xl">🏆</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#c89b3c] mb-2">The Verdict</h2>
        <p className="text-xs sm:text-sm text-[#a09b8c]">Final Analysis</p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1426] to-[#1a2336] border-2 border-[#c89b3c] rounded-lg p-4 sm:p-6 lg:p-8 text-center">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-t-2 border-l-2 sm:border-t-4 sm:border-l-4 border-[#c89b3c] opacity-30" />
        <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-b-2 border-r-2 sm:border-b-4 sm:border-r-4 border-[#c89b3c] opacity-30" />
        
        <div className="relative z-10 space-y-4 sm:space-y-6">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white leading-relaxed">
            {comparison.verdict.reasoning}
          </p>
          <div className="border-t border-[#785a28] pt-4 sm:pt-6">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#c89b3c] leading-relaxed">
              "{comparison.verdict.closing_statement}"
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mt-4 sm:mt-6">
        <button
          onClick={() => navigate("/")}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-[#c89b3c] text-[#0a1428] text-sm sm:text-base font-semibold rounded hover:bg-[#d8ac4d] transition-all transform hover:scale-105"
        >
          Compare More Players
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-4 sm:px-6 py-2 sm:py-3 border border-[#785a28] text-[#c89b3c] text-sm sm:text-base font-semibold rounded hover:bg-[#785a28]/20 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  const slides: SlideDescriptor[] = [
    {
      id: "overview",
      label: "Player Overview",
      background: "bg-gradient-to-br from-[#0a1428] via-[#111c32] to-[#1a2336]",
      video: "/a1.webm",
      content: overviewSlide,
    },
    {
      id: "stats",
      label: "Statistical Breakdown",
      background: "bg-gradient-to-br from-[#0a1428] via-[#1b2a3a] to-[#132238]",
      video: "/a2.webm",
      content: statsSlide,
    },
    {
      id: "analysis",
      label: "Analysis & Insights",
      background: "bg-gradient-to-br from-[#0a1428] via-[#161f33] to-[#1c2a3f]",
      video: "/a3.webm",
      content: analysisSlide,
    },
    {
      id: "verdict",
      label: "The Verdict",
      background: "bg-gradient-to-br from-[#0a1428] via-[#1a1f32] to-[#1e2a3d]",
      video: "/a4.webm",
      content: verdictSlide,
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#050b16] text-[#f0e6d2]">
      <div className="relative flex h-screen flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-[#785a28] px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-9 sm:w-9">
              <img src="/favicon.png" alt="Rift Rewind" className="w-full h-full" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#c89b3c]">Rift Rewind</p>
              <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-[#c89b3c]">Player Comparison</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xs sm:text-sm px-3 py-1.5 border border-[#785a28] text-[#c89b3c] rounded hover:bg-[#785a28]/20 transition-colors"
          >
            <span className="hidden sm:inline">New Comparison</span>
            <span className="sm:hidden">New</span>
          </button>
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
                  className={`relative flex h-full min-w-full flex-col px-4 py-3 text-[#f0e6d2] sm:px-6 sm:py-4 lg:px-8 lg:py-6 overflow-hidden ${slide.background}`}
                >
                  {/* Video background */}
                  {slide.video && (
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      loop
                      muted
                      playsInline
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
                    >
                      <source src={slide.video} type="video/mp4" />
                      <source src={slide.video} type="video/webm" />
                    </video>
                  )}
                  
                  {/* Gradient overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 20% 20%, rgba(200, 155, 60, 0.15), transparent 55%), radial-gradient(circle at 80% 10%, rgba(17, 28, 50, 0.4), transparent 50%)",
                    }}
                  />
                  
                  <div className="relative z-[1] h-full w-full">
                    {slide.content}
                  </div>
                </section>
              );
            })}
          </div>
        </main>

        <footer className="shrink-0 border-t border-[#273241] bg-[#050b16] px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to ${slide.label}`}
                  aria-current={index === currentSlide ? "page" : undefined}
                  className={`h-1.5 sm:h-2 rounded-full transition-all ${
                    index === currentSlide ? "w-8 sm:w-10 bg-[#c89b3c]" : "w-4 sm:w-6 bg-[#2c3542] hover:bg-[#3a4658]"
                  }`}
                  onClick={() => goToIndex(index)}
                />
              ))}
            </div>
            <p className="hidden md:block text-xs uppercase tracking-wider text-[#a09b8c]">
              {slides[currentSlide]?.label}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentSlide === 0}
                className="rounded border border-[#785a28] px-3 py-1.5 text-xs sm:text-sm font-medium text-[#c89b3c] transition-colors hover:bg-[#785a28]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Prev</span>
                <span className="sm:hidden">←</span>
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={currentSlide === slides.length - 1}
                className="rounded bg-[#c89b3c] px-3 py-1.5 text-xs sm:text-sm font-medium text-[#0a1428] transition-colors hover:bg-[#d8ac4d] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">→</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
