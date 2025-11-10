import { useEffect, useState } from "react";
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

export default function Compare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summonerIcon1, setSummonerIcon1] = useState<string | null>(null);
  const [summonerIcon2, setSummonerIcon2] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1428] via-[#0f1c2e] to-[#1a2332] py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#c89b3c]">
            {comparison.comparison_title}
          </h1>
          <p className="text-lg text-[#d1c6ac] max-w-3xl mx-auto">
            {comparison.overall_summary}
          </p>
        </div>

        {/* Player Cards Side by Side */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Player 1 */}
          <div className="group relative overflow-hidden bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-6 space-y-4 hover:border-[#c89b3c] transition-all duration-500">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#c89b3c]/5 via-transparent to-[#2196f3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#c89b3c] to-[#d8ac4d] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 shrink-0 rounded-sm border-2 border-[#c89b3c] bg-cover bg-center shadow-lg"
                  style={{ backgroundImage: `url('${summonerIcon1 || '/rift_logo.png'}')` }}
                  aria-label={summonerIcon1 ? "Player 1 summoner icon" : "Default icon"}
                />
                <h2 className="text-2xl font-bold text-white">{player1.name}</h2>
              </div>
              <button
                onClick={() => navigate(`/recap?name=${searchParams.get("name1")}&tag=${searchParams.get("tag1")}&region=${searchParams.get("region1")}`)}
                className="text-xs px-3 py-1 border border-[#c89b3c] text-[#c89b3c] rounded hover:bg-[#c89b3c] hover:text-[#0a1428] transition-colors"
              >
                View Full Recap
              </button>
            </div>
            <p className="relative text-sm uppercase tracking-wider text-[#a09b8c]">{p1Data.wrapped.archetype}</p>
            <p className="relative text-sm text-[#d1c6ac]">{p1Data.wrapped.tagline}</p>
            
            {/* Stats Grid */}
            <div className="relative grid grid-cols-2 gap-3 pt-4">
              <div className="bg-[#0a1428]/60 p-3 rounded">
                <p className="text-xs text-[#a09b8c]">Games</p>
                <p className="text-xl font-bold text-white">{p1Data.stats.games}</p>
              </div>
              <div className="bg-[#0a1428]/60 p-3 rounded">
                <p className="text-xs text-[#a09b8c]">Win Rate</p>
                <p className="text-xl font-bold text-[#c89b3c]">{p1Data.stats.winrate.toFixed(1)}%</p>
              </div>
              <div className="bg-[#0a1428]/60 p-3 rounded">
                <p className="text-xs text-[#a09b8c]">Hours</p>
                <p className="text-xl font-bold text-white">{p1Data.stats.hours}h</p>
              </div>
              <div className="bg-[#0a1428]/60 p-3 rounded">
                <p className="text-xs text-[#a09b8c]">Peak Time</p>
                <p className="text-sm font-bold text-white">{p1Data.stats.peakTime}</p>
              </div>
            </div>

            {/* Strengths */}
            <div className="relative pt-4 border-t border-[#785a28]/30">
              <p className="text-xs uppercase tracking-wider text-[#c89b3c] mb-2">Strengths</p>
              <ul className="space-y-1">
                {comparison.playstyle_comparison.player1_strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-[#d1c6ac] flex items-start">
                    <span className="text-[#c89b3c] mr-2">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Player 2 */}
          <div className="group relative overflow-hidden bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-6 space-y-4 hover:border-[#c89b3c] transition-all duration-500">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#c89b3c]/5 via-transparent to-[#2196f3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#c89b3c] to-[#d8ac4d] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 shrink-0 rounded-sm border-2 border-[#c89b3c] bg-cover bg-center shadow-lg"
                  style={{ backgroundImage: `url('${summonerIcon2 || '/rift_logo.png'}')` }}
                  aria-label={summonerIcon2 ? "Player 2 summoner icon" : "Default icon"}
                />
                <h2 className="text-2xl font-bold text-white">{player2.name}</h2>
              </div>
              <button
                onClick={() => navigate(`/recap?name=${searchParams.get("name2")}&tag=${searchParams.get("tag2")}&region=${searchParams.get("region2")}`)}
                className="text-xs px-3 py-1 border border-[#c89b3c] text-[#c89b3c] rounded hover:bg-[#c89b3c] hover:text-[#0a1428] transition-colors"
              >
                View Full Recap
              </button>
            </div>
            <p className="relative text-sm uppercase tracking-wider text-[#a09b8c]">{p2Data.wrapped.archetype}</p>
            <p className="relative text-sm text-[#d1c6ac]">{p2Data.wrapped.tagline}</p>
            
            {/* Stats Grid */}
            <div className="relative grid grid-cols-2 gap-3 pt-4">
              <div className="bg-[#0a1428]/60 p-3 rounded">
                <p className="text-xs text-[#a09b8c]">Games</p>
                <p className="text-xl font-bold text-white">{p2Data.stats.games}</p>
              </div>
              <div className="bg-[#0a1428]/60 p-3 rounded">
                <p className="text-xs text-[#a09b8c]">Win Rate</p>
                <p className="text-xl font-bold text-[#c89b3c]">{p2Data.stats.winrate.toFixed(1)}%</p>
              </div>
              <div className="bg-[#0a1428]/60 p-3 rounded">
                <p className="text-xs text-[#a09b8c]">Hours</p>
                <p className="text-xl font-bold text-white">{p2Data.stats.hours}h</p>
              </div>
              <div className="bg-[#0a1428]/60 p-3 rounded">
                <p className="text-xs text-[#a09b8c]">Peak Time</p>
                <p className="text-sm font-bold text-white">{p2Data.stats.peakTime}</p>
              </div>
            </div>

            {/* Strengths */}
            <div className="relative pt-4 border-t border-[#785a28]/30">
              <p className="text-xs uppercase tracking-wider text-[#c89b3c] mb-2">Strengths</p>
              <ul className="space-y-1">
                {comparison.playstyle_comparison.player2_strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-[#d1c6ac] flex items-start">
                    <span className="text-[#c89b3c] mr-2">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Statistical Comparison */}
        <div className="group relative overflow-hidden bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-6 space-y-4 hover:border-[#c89b3c] transition-all duration-500">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#c89b3c]/5 via-transparent to-[#2196f3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#c89b3c] to-[#d8ac4d] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
          
          <h3 className="relative text-2xl font-bold text-[#c89b3c] mb-4">Head-to-Head Stats</h3>
          <div className="relative space-y-3">
            {comparison.statistical_comparison.map((stat, idx) => (
              <div key={idx} className="bg-[#0a1428]/60 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{stat.category}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className={`text-right ${stat.winner === 'player1' ? 'text-[#c89b3c] font-bold' : 'text-[#a09b8c]'}`}>
                    {stat.player1_value}
                  </div>
                  <div className="text-center text-xs text-[#785a28]">VS</div>
                  <div className={`text-left ${stat.winner === 'player2' ? 'text-[#c89b3c] font-bold' : 'text-[#a09b8c]'}`}>
                    {stat.player2_value}
                  </div>
                </div>
                <p className="text-xs text-[#d1c6ac] mt-2 italic">{stat.insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Playstyle Comparison */}
        <div className="group relative overflow-hidden bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-6 space-y-4 hover:border-[#c89b3c] transition-all duration-500">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#c89b3c]/5 via-transparent to-[#2196f3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#c89b3c] to-[#d8ac4d] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
          
          <h3 className="relative text-2xl font-bold text-[#c89b3c]">Playstyle Analysis</h3>
          <p className="relative text-[#d1c6ac]">{comparison.playstyle_comparison.summary}</p>
        </div>

        {/* Champion Comparison */}
        <div className="group relative overflow-hidden bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-6 space-y-4 hover:border-[#c89b3c] transition-all duration-500">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#c89b3c]/5 via-transparent to-[#2196f3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#c89b3c] to-[#d8ac4d] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
          
          <h3 className="relative text-2xl font-bold text-[#c89b3c]">Champion Pools</h3>
          <p className="relative text-[#d1c6ac]">{comparison.champion_comparison.summary}</p>
          
          {comparison.champion_comparison.common_picks && comparison.champion_comparison.common_picks.length > 0 && (
            <div className="relative">
              <p className="text-sm text-[#a09b8c] mb-2">Common Picks:</p>
              <div className="flex flex-wrap gap-2">
                {comparison.champion_comparison.common_picks.map((champ, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#0a1428]/60 border border-[#785a28] rounded text-sm text-white">
                    {champ}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Key Differences */}
        <div className="group relative overflow-hidden bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-6 space-y-4 hover:border-[#c89b3c] transition-all duration-500">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#c89b3c]/5 via-transparent to-[#2196f3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#c89b3c] to-[#d8ac4d] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
          
          <h3 className="relative text-2xl font-bold text-[#c89b3c]">Key Differences</h3>
          <ul className="relative space-y-2">
            {comparison.key_differences.map((diff, idx) => (
              <li key={idx} className="text-[#d1c6ac] flex items-start">
                <span className="text-[#c89b3c] mr-2 mt-1">▸</span>
                <span>{diff}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Verdict */}
        <div className="group relative overflow-hidden bg-gradient-to-r from-[#785a28]/20 to-[#c89b3c]/20 border-2 border-[#c89b3c] rounded-lg p-8 text-center space-y-4 hover:border-[#d8ac4d] transition-all duration-500">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#c89b3c]/5 via-transparent to-[#2196f3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#c89b3c] to-[#d8ac4d] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
          
          <h3 className="relative text-3xl font-bold text-[#c89b3c]">The Verdict</h3>
          <p className="relative text-lg text-white">{comparison.verdict.reasoning}</p>
          <p className="relative text-xl font-semibold text-[#c89b3c] italic">
            {comparison.verdict.closing_statement}
          </p>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-[#c89b3c] text-[#0a1428] font-semibold rounded-sm hover:bg-[#d8ac4d] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
