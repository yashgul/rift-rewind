import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { useRecapData } from "@/contexts/RecapDataContext";

interface ComparisonData {
  player1: {
    name: string;
    region: string;
    stats: {
      games: number;
      winrate: number;
      hours: number;
      peakTime: string;
      bestMonth: string;
    };
    wrapped_info: {
      tagline: string;
      summary: string;
      archetype: string;
    };
  };
  player2: {
    name: string;
    region: string;
    stats: {
      games: number;
      winrate: number;
      hours: number;
      peakTime: string;
      bestMonth: string;
    };
    wrapped_info: {
      tagline: string;
      summary: string;
      archetype: string;
    };
  };
  comparison: {
    overall_verdict: string;
    performance_comparison: string[];
    playstyle_comparison: string[];
    champion_comparison: string[];
    standout_moments: string[];
    rivalry_summary: string;
  };
}

export default function Compare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getComparisonCache, setComparisonCache } = useRecapData();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const name1 = searchParams.get("name1");
    const tag1 = searchParams.get("tag1");
    const region1 = searchParams.get("region1");
    const name2 = searchParams.get("name2");
    const tag2 = searchParams.get("tag2");
    const region2 = searchParams.get("region2");
    const testMode = searchParams.get("test_mode") === "true";

    if (!name1 || !tag1 || !region1 || !name2 || !tag2 || !region2) {
      navigate("/");
      return;
    }

    const currentParams = `${name1}_${tag1}_${region1}_${name2}_${tag2}_${region2}`;
    
    // Check if we have cached comparison data for these exact params
    const cached = getComparisonCache();
    if (cached && cached.searchParams === currentParams) {
      console.log("Using cached comparison data");
      setComparisonData({
        player1: cached.players.player1,
        player2: cached.players.player2,
        comparison: cached.comparison
      });
      setIsLoading(false);
      return;
    }

    const fetchComparisonData = async () => {
      try {
        setIsLoading(true);
        const testModeParam = testMode ? '&test_mode=true' : '';
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';
        const response = await fetch(
          `${backendUrl}/api/compareData?name1=${name1}&tag1=${tag1}&region1=${region1}&name2=${name2}&tag2=${tag2}&region2=${region2}${testModeParam}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch comparison data");
        }

        const data = await response.json();
        const compData = data.message;
        setComparisonData(compData);
        
        // Cache the comparison data
        setComparisonCache({
          players: {
            player1: compData.player1,
            player2: compData.player2
          },
          comparison: compData.comparison,
          searchParams: currentParams
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparisonData();
  }, [searchParams, navigate, getComparisonCache, setComparisonCache]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#c89b3c] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xl text-[#c89b3c] font-rajdhani">Comparing Players...</p>
        </div>
      </div>
    );
  }

  if (error || !comparisonData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <h2 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            Error Loading Comparison
          </h2>
          <p className="text-red-400 font-rajdhani text-lg">{error}</p>
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

  const { player1, player2, comparison } = comparisonData;
  
  // Get current search params to pass along for back navigation
  const comparisonParams = searchParams.toString();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-4">
            Player Comparison
          </h1>
          <p className="text-xl text-[#d1c6ac] font-rajdhani">
            {player1.name} ⚔️ {player2.name}
          </p>
        </div>

        {/* Player Stats Cards - Side by Side */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Player 1 */}
          <div className="bg-[#0b1426]/95 border-2 border-[#785a28] rounded-lg p-6 hover:border-[#c89b3c] transition-all">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#c89b3c]">{player1.name}</h2>
              <button
                onClick={() => {
                  const [name, tag] = player1.name.split('#');
                  navigate(`/recap?name=${name}&tag=${tag}&region=${player1.region}&fromCompare=true&comparisonParams=${encodeURIComponent(comparisonParams)}`);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-card/40 border border-[#785a28] hover:border-[#c89b3c] rounded text-sm text-[#c89b3c] transition-all"
              >
                Full Recap <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-[#0a1428]/60 p-4 rounded border border-[#273241]">
                <p className="text-xs uppercase tracking-wider text-[#a09b8c] mb-1">Archetype</p>
                <p className="text-lg font-bold text-white">{player1.wrapped_info.archetype}</p>
                <p className="text-sm text-[#d1c6ac] mt-2">{player1.wrapped_info.tagline}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0a1428]/60 p-3 rounded border border-[#273241]">
                  <p className="text-xs uppercase tracking-wider text-[#a09b8c]">Games</p>
                  <p className="text-2xl font-bold text-white">{player1.stats.games}</p>
                </div>
                <div className="bg-[#0a1428]/60 p-3 rounded border border-[#273241]">
                  <p className="text-xs uppercase tracking-wider text-[#a09b8c]">Win Rate</p>
                  <p className="text-2xl font-bold text-[#4caf50]">{player1.stats.winrate.toFixed(1)}%</p>
                </div>
                <div className="bg-[#0a1428]/60 p-3 rounded border border-[#273241]">
                  <p className="text-xs uppercase tracking-wider text-[#a09b8c]">Hours</p>
                  <p className="text-2xl font-bold text-white">{player1.stats.hours}h</p>
                </div>
                <div className="bg-[#0a1428]/60 p-3 rounded border border-[#273241]">
                  <p className="text-xs uppercase tracking-wider text-[#a09b8c]">Peak Time</p>
                  <p className="text-sm font-bold text-white">{player1.stats.peakTime}</p>
                </div>
              </div>

              <div className="bg-[#0a1428]/60 p-3 rounded border border-[#273241]">
                <p className="text-xs uppercase tracking-wider text-[#a09b8c] mb-2">Summary</p>
                <p className="text-sm text-[#d1c6ac]">{player1.wrapped_info.summary}</p>
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className="bg-[#0b1426]/95 border-2 border-[#785a28] rounded-lg p-6 hover:border-[#c89b3c] transition-all">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#c89b3c]">{player2.name}</h2>
              <button
                onClick={() => {
                  const [name, tag] = player2.name.split('#');
                  navigate(`/recap?name=${name}&tag=${tag}&region=${player2.region}&fromCompare=true&comparisonParams=${encodeURIComponent(comparisonParams)}`);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-card/40 border border-[#785a28] hover:border-[#c89b3c] rounded text-sm text-[#c89b3c] transition-all"
              >
                Full Recap <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-[#0a1428]/60 p-4 rounded border border-[#273241]">
                <p className="text-xs uppercase tracking-wider text-[#a09b8c] mb-1">Archetype</p>
                <p className="text-lg font-bold text-white">{player2.wrapped_info.archetype}</p>
                <p className="text-sm text-[#d1c6ac] mt-2">{player2.wrapped_info.tagline}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0a1428]/60 p-3 rounded border border-[#273241]">
                  <p className="text-xs uppercase tracking-wider text-[#a09b8c]">Games</p>
                  <p className="text-2xl font-bold text-white">{player2.stats.games}</p>
                </div>
                <div className="bg-[#0a1428]/60 p-3 rounded border border-[#273241]">
                  <p className="text-xs uppercase tracking-wider text-[#a09b8c]">Win Rate</p>
                  <p className="text-2xl font-bold text-[#4caf50]">{player2.stats.winrate.toFixed(1)}%</p>
                </div>
                <div className="bg-[#0a1428]/60 p-3 rounded border border-[#273241]">
                  <p className="text-xs uppercase tracking-wider text-[#a09b8c]">Hours</p>
                  <p className="text-2xl font-bold text-white">{player2.stats.hours}h</p>
                </div>
                <div className="bg-[#0a1428]/60 p-3 rounded border border-[#273241]">
                  <p className="text-xs uppercase tracking-wider text-[#a09b8c]">Peak Time</p>
                  <p className="text-sm font-bold text-white">{player2.stats.peakTime}</p>
                </div>
              </div>

              <div className="bg-[#0a1428]/60 p-3 rounded border border-[#273241]">
                <p className="text-xs uppercase tracking-wider text-[#a09b8c] mb-2">Summary</p>
                <p className="text-sm text-[#d1c6ac]">{player2.wrapped_info.summary}</p>
              </div>
            </div>
          </div>
        </div>

        {/* LLM Comparison Analysis */}
        <div className="bg-[#0b1426]/95 border-2 border-[#c89b3c] rounded-lg p-8 space-y-8">
          <h2 className="text-3xl font-bold text-center text-[#c89b3c] mb-6">The Verdict</h2>
          
          {/* Overall Verdict */}
          <div className="bg-[#0a1428]/60 p-6 rounded-lg border border-[#785a28]">
            <p className="text-lg text-[#d1c6ac] leading-relaxed">{comparison.overall_verdict}</p>
          </div>

          {/* Performance Comparison */}
          <div>
            <h3 className="text-xl font-bold text-[#c89b3c] mb-4 uppercase tracking-wider">⚡ Performance</h3>
            <ul className="space-y-3">
              {comparison.performance_comparison.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-[#0a1428]/60 p-4 rounded border border-[#273241]">
                  <span className="text-[#c89b3c] mt-1">•</span>
                  <span className="text-[#d1c6ac]">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Playstyle Comparison */}
          <div>
            <h3 className="text-xl font-bold text-[#c89b3c] mb-4 uppercase tracking-wider">🎯 Playstyle</h3>
            <ul className="space-y-3">
              {comparison.playstyle_comparison.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-[#0a1428]/60 p-4 rounded border border-[#273241]">
                  <span className="text-[#c89b3c] mt-1">•</span>
                  <span className="text-[#d1c6ac]">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Champion Comparison */}
          <div>
            <h3 className="text-xl font-bold text-[#c89b3c] mb-4 uppercase tracking-wider">🏆 Champions</h3>
            <ul className="space-y-3">
              {comparison.champion_comparison.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-[#0a1428]/60 p-4 rounded border border-[#273241]">
                  <span className="text-[#c89b3c] mt-1">•</span>
                  <span className="text-[#d1c6ac]">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Standout Moments */}
          <div>
            <h3 className="text-xl font-bold text-[#c89b3c] mb-4 uppercase tracking-wider">✨ Standout Moments</h3>
            <ul className="space-y-3">
              {comparison.standout_moments.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-[#0a1428]/60 p-4 rounded border border-[#273241]">
                  <span className="text-[#c89b3c] mt-1">•</span>
                  <span className="text-[#d1c6ac]">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rivalry Summary */}
          <div className="bg-gradient-gold p-6 rounded-lg">
            <p className="text-lg text-[#0a1428] font-semibold text-center">{comparison.rivalry_summary}</p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-card border-2 border-[#785a28] hover:border-[#c89b3c] rounded-lg text-[#c89b3c] font-semibold transition-all hover:shadow-glow"
          >
            Compare Other Players
          </button>
        </div>
      </div>
    </div>
  );
}
