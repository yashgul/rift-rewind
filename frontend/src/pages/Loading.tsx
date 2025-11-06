import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Loading = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username");

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }

    // Simulate loading time
    const timer = setTimeout(() => {
      navigate(`/recap?username=${username}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [username, navigate]);

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
            Analyzing Your Season
          </h2>
          <div className="space-y-2">
            <p className="text-muted-foreground animate-pulse" style={{ animationDelay: '0s' }}>
              Processing {username}'s match history...
            </p>
            <p className="text-muted-foreground animate-pulse" style={{ animationDelay: '0.5s' }}>
              Calculating playstyle metrics...
            </p>
            <p className="text-muted-foreground animate-pulse" style={{ animationDelay: '1s' }}>
              Generating your persona...
            </p>
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
