import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [mode, setMode] = useState<"solo" | "compare">("solo");
  const [riotId, setRiotId] = useState(""); // Format: "name#tag"
  const [region, setRegion] = useState<string>("");
  
  // Comparison mode states
  const [riotId1, setRiotId1] = useState("");
  const [region1, setRegion1] = useState<string>("");
  const [riotId2, setRiotId2] = useState("");
  const [region2, setRegion2] = useState<string>("");
  
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState("");
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
    setError("");

    if (mode === "solo") {
      // Validate region is selected
      if (!region) {
        setError("Please select a region");
        return;
      }

      // Parse Riot ID (name#tag format)
      if (!riotId.trim()) {
        setError("Please enter your Riot ID");
        return;
      }

      const parts = riotId.trim().split('#');
      if (parts.length !== 2) {
        setError("Please enter your Riot ID in the format: name#tag (e.g., Hide on bush#KR1)");
        return;
      }

      const [name, tag] = parts;
      if (!name || !tag) {
        setError("Both name and tag are required (e.g., Hide on bush#KR1)");
        return;
      }

      // Navigate directly to recap page with query parameters
      navigate(`/recap?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}&region=${encodeURIComponent(region)}`);
    } else {
      // Comparison mode validation
      if (!region1 || !region2) {
        setError("Please select regions for both players");
        return;
      }

      if (!riotId1.trim() || !riotId2.trim()) {
        setError("Please enter both players' Riot IDs");
        return;
      }

      const parts1 = riotId1.trim().split('#');
      const parts2 = riotId2.trim().split('#');

      if (parts1.length !== 2 || parts2.length !== 2) {
        setError("Please enter both Riot IDs in the format: name#tag");
        return;
      }

      const [name1, tag1] = parts1;
      const [name2, tag2] = parts2;

      if (!name1 || !tag1 || !name2 || !tag2) {
        setError("Both name and tag are required for each player");
        return;
      }

      // Navigate to compare page with query parameters
      navigate(`/compare?name1=${encodeURIComponent(name1)}&tag1=${encodeURIComponent(tag1)}&region1=${encodeURIComponent(region1)}&name2=${encodeURIComponent(name2)}&tag2=${encodeURIComponent(tag2)}&region2=${encodeURIComponent(region2)}`);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden group">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover filter brightness-115 contrast-120 saturate-110"
      >
        <source src="https://ask-them-out.s3.ap-south-1.amazonaws.com/tmpt2lr5oe6.mp4" type="video/mp4" />
      </video>

      {/* Audio */}
      <audio ref={audioRef} loop muted={isMuted}>
        <source src="/league-audio.mp3" type="audio/mpeg" />
      </audio>

      {/* Overlay - slightly darker with subtle blur */}
      <div className="absolute inset-0 bg-lol-dark/15 backdrop-blur-[0.5px]" />

      {/* Decorative rings removed */}
      
      {/* Removed floating background squares/particles */}
      
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
        <div className="text-center space-y-8 max-w-2xl scale-[1.17]">
          {/* Title */}
          <div className="space-y-4 animate-fade-in relative">
            {/* Glowing orbs behind title */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-lol-gold/10 rounded-full blur-3xl animate-pulse-gold" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-lol-blue/5 rounded-full blur-3xl animate-pulse-gold" style={{ animationDelay: '1s' }} />
            <img
              src="/rift_logo1.png"
              alt="League of Legends"
              className="
                w-100 h-100 
                scale-[0.9]
                drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] 
                transition-all duration-300 ease-in-out
                hover:scale-110 
                hover:drop-shadow-[0_0_25px_rgba(255,215,0,0.5)]
              "
            />
            <p className="text-xl md:text-2xl text-foreground/90 font-rajdhani font-medium animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Discover your League of Legends journey this year
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4 animate-scale-in">
            {/* Mode Selector */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as "solo" | "compare")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-card/80 backdrop-blur-sm border border-lol-gold/30">
                <TabsTrigger value="solo" className="font-rajdhani font-medium data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground">
                  Solo Recap
                </TabsTrigger>
                <TabsTrigger value="compare" className="font-rajdhani font-medium data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground">
                  Duo Comparison
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {mode === "solo" ? (
              // Solo mode inputs
              <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3">
                {/* Region Selector */}
                <div className="relative max-w-[120px] w-full group">
                  <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-lg" />
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="h-14 text-xl leading-tight bg-card/80 backdrop-blur-sm border-lol-gold/30 focus:border-lol-gold text-foreground font-rajdhani font-medium relative hover:border-lol-gold/60 transition-all duration-300 px-3">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NA1">NA</SelectItem>
                      <SelectItem value="EUW1">EUW</SelectItem>
                      <SelectItem value="EUN1">EUNE</SelectItem>
                      <SelectItem value="BR1">BR</SelectItem>
                      <SelectItem value="KR">KR</SelectItem>
                      <SelectItem value="PBE1">PBE</SelectItem>
                      <SelectItem value="LA1">LAN</SelectItem>
                      <SelectItem value="LA2">LAS</SelectItem>
                      <SelectItem value="OC1">OCE</SelectItem>
                      <SelectItem value="TR1">TR</SelectItem>
                      <SelectItem value="RU">RU</SelectItem>
                      <SelectItem value="JP1">JP</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Riot ID Input */}
                <div className="relative max-w-md w-full group">
                  <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-lg" />
                  <Input
                    type="text"
                    placeholder="name#tag (e.g., Hide on bush#KR1)"
                    value={riotId}
                    onChange={(e) => setRiotId(e.target.value)}
                    className="h-14 text-xl leading-tight bg-card/80 backdrop-blur-sm border-lol-gold/30 focus:border-lol-gold text-foreground placeholder:text-muted-foreground font-rajdhani font-medium relative hover:border-lol-gold/60 transition-all duration-300 px-3"
                  />
                </div>
              </div>
            ) : (
              // Comparison mode inputs
              <div className="space-y-3">
                {/* Player 1 */}
                <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3">
                  <div className="relative max-w-[120px] w-full group">
                    <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-lg" />
                    <Select value={region1} onValueChange={setRegion1}>
                      <SelectTrigger className="h-14 text-xl leading-tight bg-card/80 backdrop-blur-sm border-lol-gold/30 focus:border-lol-gold text-foreground font-rajdhani font-medium relative hover:border-lol-gold/60 transition-all duration-300 px-3">
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NA1">NA</SelectItem>
                        <SelectItem value="EUW1">EUW</SelectItem>
                        <SelectItem value="EUN1">EUNE</SelectItem>
                        <SelectItem value="BR1">BR</SelectItem>
                        <SelectItem value="KR">KR</SelectItem>
                        <SelectItem value="PBE1">PBE</SelectItem>
                        <SelectItem value="LA1">LAN</SelectItem>
                        <SelectItem value="LA2">LAS</SelectItem>
                        <SelectItem value="OC1">OCE</SelectItem>
                        <SelectItem value="TR1">TR</SelectItem>
                        <SelectItem value="RU">RU</SelectItem>
                        <SelectItem value="JP1">JP</SelectItem>
                        <SelectItem value="asia">Asia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="relative max-w-md w-full group">
                    <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-lg" />
                    <Input
                      type="text"
                      placeholder="Player 1: name#tag"
                      value={riotId1}
                      onChange={(e) => setRiotId1(e.target.value)}
                      className="h-14 text-xl leading-tight bg-card/80 backdrop-blur-sm border-lol-gold/30 focus:border-lol-gold text-foreground placeholder:text-muted-foreground font-rajdhani font-medium relative hover:border-lol-gold/60 transition-all duration-300 px-3"
                    />
                  </div>
                </div>

                {/* VS Divider */}
                <div className="text-center">
                  <span className="text-lol-gold font-bebas text-2xl tracking-wider">VS</span>
                </div>

                {/* Player 2 */}
                <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3">
                  <div className="relative max-w-[120px] w-full group">
                    <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-lg" />
                    <Select value={region2} onValueChange={setRegion2}>
                      <SelectTrigger className="h-14 text-xl leading-tight bg-card/80 backdrop-blur-sm border-lol-gold/30 focus:border-lol-gold text-foreground font-rajdhani font-medium relative hover:border-lol-gold/60 transition-all duration-300 px-3">
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NA1">NA</SelectItem>
                        <SelectItem value="EUW1">EUW</SelectItem>
                        <SelectItem value="EUN1">EUNE</SelectItem>
                        <SelectItem value="BR1">BR</SelectItem>
                        <SelectItem value="KR">KR</SelectItem>
                        <SelectItem value="PBE1">PBE</SelectItem>
                        <SelectItem value="LA1">LAN</SelectItem>
                        <SelectItem value="LA2">LAS</SelectItem>
                        <SelectItem value="OC1">OCE</SelectItem>
                        <SelectItem value="TR1">TR</SelectItem>
                        <SelectItem value="RU">RU</SelectItem>
                        <SelectItem value="JP1">JP</SelectItem>
                        <SelectItem value="asia">Asia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="relative max-w-md w-full group">
                    <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-lg" />
                    <Input
                      type="text"
                      placeholder="Player 2: name#tag"
                      value={riotId2}
                      onChange={(e) => setRiotId2(e.target.value)}
                      className="h-14 text-xl leading-tight bg-card/80 backdrop-blur-sm border-lol-gold/30 focus:border-lol-gold text-foreground placeholder:text-muted-foreground font-rajdhani font-medium relative hover:border-lol-gold/60 transition-all duration-300 px-3"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm font-rajdhani animate-fade-in">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="bg-gradient-gold hover:shadow-glow hover:scale-105 transition-all duration-300 text-primary-foreground font-bebas tracking-wider px-8 h-14 text-xl group relative overflow-hidden"
              disabled={mode === "solo" ? (!riotId.trim() || !region) : (!riotId1.trim() || !region1 || !riotId2.trim() || !region2)}
            >
              <span className="relative z-10">
                {mode === "solo" ? "VIEW MY RECAP" : "COMPARE PLAYERS"}
              </span>
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
