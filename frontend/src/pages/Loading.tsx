import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Loading = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const tag = searchParams.get("tag");
  const region = searchParams.get("region");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name || !tag || !region) {
      navigate("/");
      return;
    }

    const fetchRecapData = async () => {
      try {
        // Get backend URL from environment variable
        // Empty string means use relative URL (for production with nginx proxy)
        const backendUrl = import.meta.env.VITE_BACKEND_URL === undefined ? 'http://localhost:9000' : import.meta.env.VITE_BACKEND_URL;
        
        // Construct the API URL with proper parameters
        const apiUrl = `${backendUrl}/api/matchData?tag=${encodeURIComponent(tag)}&name=${encodeURIComponent(name)}&region=${encodeURIComponent(region)}`;
        
        console.log("Fetching from:", apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("API Response:", data);
        
        // Store the data in localStorage
        localStorage.setItem('recapData', JSON.stringify(data.message.wrapped_data));
        localStorage.setItem('riotId', `${name}#${tag}`);
        
        // Navigate to recap page
        navigate(`/recap?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}`);
      } catch (err) {
        console.error("Error fetching recap data:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load recap data";
        setError(errorMessage);
        // Show error to user - NO FALLBACK
      }
    };

    fetchRecapData();
  }, [name, tag, region, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-gold" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-gold" style={{ animationDelay: '1s' }} />
      </div>

      {/* Loading content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Hexagon spinner */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 animate-spin">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(45, 86%, 51%)" />
                  <stop offset="100%" stopColor="hsl(35, 90%, 60%)" />
                </linearGradient>
              </defs>
              <polygon
                points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="3"
                className="drop-shadow-glow"
              />
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-gold rounded-full animate-pulse-gold" />
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            {error ? "Error Loading Data" : "Analyzing Your Season"}
          </h2>
          <div className="space-y-2">
            {error ? (
              <div className="space-y-3">
                <p className="text-red-400 font-rajdhani text-lg">
                  {error}
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-2 bg-card border border-border hover:border-primary transition-colors rounded-lg text-foreground font-semibold"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground animate-pulse" style={{ animationDelay: '0s' }}>
                  Processing {name}#{tag} match history...
                </p>
                <p className="text-muted-foreground animate-pulse" style={{ animationDelay: '0.5s' }}>
                  Calculating playstyle metrics...
                </p>
                <p className="text-muted-foreground animate-pulse" style={{ animationDelay: '1s' }}>
                  Generating your persona...
                </p>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-gold animate-shimmer"
              style={{
                backgroundSize: '200% 100%',
                width: '100%',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
