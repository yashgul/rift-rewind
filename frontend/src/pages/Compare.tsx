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
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:9000";
        
        const params = new URLSearchParams({
          name1,
          tag1,
          region1,
          name2,
          tag2,
          region2,
          test_mode: testMode.toString(),
        });

        const response = await fetch(`${apiUrl}/api/compareData?${params}`);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1428] via-[#0f1c2e] to-[#1a2332]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#c89b3c] mx-auto"></div>
          <p className="text-xl text-[#c89b3c] font-semibold">Comparing Players...</p>
          <p className="text-sm text-[#a09b8c]">Analyzing performance data</p>
        </div>
      </div>
    );
  }

  if (error || !compareData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1428] via-[#0f1c2e] to-[#1a2332] p-4">
        <div className="max-w-md w-full bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-[#c89b3c]">Error Loading Comparison</h2>
          <p className="text-[#d1c6ac]">{error || "Failed to load comparison data"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#c89b3c] text-[#0a1428] font-semibold rounded-sm hover:bg-[#d8ac4d] transition-colors"
          >
            Go Back Home
          </button>
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
          <div className="bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{player1.name}</h2>
              <button
                onClick={() => navigate(`/recap?name=${searchParams.get("name1")}&tag=${searchParams.get("tag1")}&region=${searchParams.get("region1")}`)}
                className="text-xs px-3 py-1 border border-[#c89b3c] text-[#c89b3c] rounded hover:bg-[#c89b3c] hover:text-[#0a1428] transition-colors"
              >
                View Full Recap
              </button>
            </div>
            <p className="text-sm uppercase tracking-wider text-[#a09b8c]">{p1Data.wrapped.archetype}</p>
            <p className="text-sm text-[#d1c6ac]">{p1Data.wrapped.tagline}</p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4">
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
            <div className="pt-4 border-t border-[#785a28]/30">
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
          <div className="bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{player2.name}</h2>
              <button
                onClick={() => navigate(`/recap?name=${searchParams.get("name2")}&tag=${searchParams.get("tag2")}&region=${searchParams.get("region2")}`)}
                className="text-xs px-3 py-1 border border-[#c89b3c] text-[#c89b3c] rounded hover:bg-[#c89b3c] hover:text-[#0a1428] transition-colors"
              >
                View Full Recap
              </button>
            </div>
            <p className="text-sm uppercase tracking-wider text-[#a09b8c]">{p2Data.wrapped.archetype}</p>
            <p className="text-sm text-[#d1c6ac]">{p2Data.wrapped.tagline}</p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4">
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
            <div className="pt-4 border-t border-[#785a28]/30">
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
        <div className="bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-6 space-y-4">
          <h3 className="text-2xl font-bold text-[#c89b3c] mb-4">Head-to-Head Stats</h3>
          <div className="space-y-3">
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
        <div className="bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-6 space-y-4">
          <h3 className="text-2xl font-bold text-[#c89b3c]">Playstyle Analysis</h3>
          <p className="text-[#d1c6ac]">{comparison.playstyle_comparison.summary}</p>
        </div>

        {/* Champion Comparison */}
        <div className="bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-6 space-y-4">
          <h3 className="text-2xl font-bold text-[#c89b3c]">Champion Pools</h3>
          <p className="text-[#d1c6ac]">{comparison.champion_comparison.summary}</p>
          
          {comparison.champion_comparison.common_picks && comparison.champion_comparison.common_picks.length > 0 && (
            <div>
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
        <div className="bg-[#0b1426]/90 border-2 border-[#785a28] rounded-lg p-6 space-y-4">
          <h3 className="text-2xl font-bold text-[#c89b3c]">Key Differences</h3>
          <ul className="space-y-2">
            {comparison.key_differences.map((diff, idx) => (
              <li key={idx} className="text-[#d1c6ac] flex items-start">
                <span className="text-[#c89b3c] mr-2 mt-1">▸</span>
                <span>{diff}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Verdict */}
        <div className="bg-gradient-to-r from-[#785a28]/20 to-[#c89b3c]/20 border-2 border-[#c89b3c] rounded-lg p-8 text-center space-y-4">
          <h3 className="text-3xl font-bold text-[#c89b3c]">The Verdict</h3>
          <p className="text-lg text-white">{comparison.verdict.reasoning}</p>
          <p className="text-xl font-semibold text-[#c89b3c] italic">
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
