import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";

const Index = () => {
  const [username, setUsername] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-play audio on mount with reduced volume
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {
        // Auto-play blocked, user will need to interact first
        setIsMuted(true);
      });
    }
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/loading?username=${encodeURIComponent(username)}`);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://ask-them-out.s3.ap-south-1.amazonaws.com/tmpt2lr5oe6.mp4" type="video/mp4" />
      </video>

      {/* Audio */}
      <audio ref={audioRef} loop muted={isMuted}>
        <source src="/league-audio.mp3" type="audio/mpeg" />
      </audio>

      {/* Overlay - lighter to show video better */}
      <div className="absolute inset-0 bg-lol-dark/30 backdrop-blur-[2px]" />
      
      {/* Animated Hex Grid Background */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-lol-gold/20 rotate-45 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-lol-blue/30 rotate-12 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-lol-gold/15 -rotate-12 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 right-1/3 w-28 h-28 border-2 border-lol-blue/20 rotate-45 animate-float" style={{ animationDelay: '1.5s' }} />
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-lol-gold/40 rounded-full animate-pulse-gold" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-lol-blue/30 rounded-full animate-pulse-gold" style={{ animationDelay: '1.2s' }} />
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-lol-gold/50 rounded-full animate-pulse-gold" style={{ animationDelay: '2.5s' }} />
      </div>
      
      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-6 right-6 z-20 p-3 rounded-full bg-card/40 backdrop-blur-md border border-lol-gold/30 hover:bg-card/60 hover:border-lol-gold transition-all duration-300 hover:shadow-gold group"
        aria-label={isMuted ? "Unmute audio" : "Mute audio"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-lol-gold" />
        ) : (
          <Volume2 className="w-5 h-5 text-lol-gold group-hover:animate-pulse" />
        )}
      </button>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl">
          {/* Title */}
          <div className="space-y-4 animate-fade-in relative">
            {/* Glowing orbs behind title */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-lol-gold/10 rounded-full blur-3xl animate-pulse-gold" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-lol-blue/5 rounded-full blur-3xl animate-pulse-gold" style={{ animationDelay: '1s' }} />
            
            <h1 className="text-8xl md:text-9xl font-bebas tracking-[0.2em] bg-gradient-gold bg-clip-text text-transparent drop-shadow-glow hover:scale-105 transition-transform duration-300 relative animate-shimmer bg-[length:200%_100%]">
              RIFT REWIND
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 font-rajdhani font-medium animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Discover your League of Legends journey this year
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4 animate-scale-in">
            <div className="relative max-w-md mx-auto group">
              <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-lg" />
              <Input
                type="text"
                placeholder="Enter your summoner name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 text-lg bg-card/80 backdrop-blur-sm border-lol-gold/30 focus:border-lol-gold text-foreground placeholder:text-muted-foreground font-rajdhani font-medium relative hover:border-lol-gold/60 transition-all duration-300"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-gold hover:shadow-glow hover:scale-105 transition-all duration-300 text-primary-foreground font-bebas tracking-wider px-8 h-14 text-xl group relative overflow-hidden"
              disabled={!username.trim()}
            >
              <span className="relative z-10">VIEW MY RECAP</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            </Button>
          </form>

          {/* Footer text */}
          <p className="text-sm text-muted-foreground animate-fade-in font-rajdhani">
            Powered by advanced analytics and AI insights
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
