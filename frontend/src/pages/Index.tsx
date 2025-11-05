import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [username, setUsername] = useState("");
  const [region, setRegion] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(
        `/loading?username=${encodeURIComponent(
          username
        )}&region=${encodeURIComponent(region)}`
      );
    }
  };

  return (
    <div className="relative min-h-screen group">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover filter brightness-100 contrast-100 saturate-155"
      >
        <source
          src="https://ask-them-out.s3.ap-south-1.amazonaws.com/tmpt2lr5oe6.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-lol-dark/10" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl scale-[1.17]">
          {/* Title */}
          <div className="space-y-4 animate-fade-in relative">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-lol-gold/10 rounded-full blur-3xl animate-pulse-gold" />
            <div
              className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-lol-blue/5 rounded-full blur-3xl animate-pulse-gold"
              style={{ animationDelay: "1s" }}
            />
            <img
              src="/rift_logo1.png"
              alt="League of Legends"
              className="w-100 h-100 scale-[0.9] drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all duration-300 ease-in-out hover:scale-110 hover:drop-shadow-[0_0_25px_rgba(255,215,0,0.5)]"
            />
            <p
              className="text-xl md:text-2xl text-foreground/90 font-rajdhani font-medium animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              Discover your League of Legends journey this year
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 animate-scale-in">
            <div className="relative max-w-md w-full mx-auto group">
              <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-lg" />
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter your summoner name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-14 text-xl leading-tight bg-card/80 backdrop-blur-sm border-lol-gold/30 focus:border-lol-gold text-foreground placeholder:text-muted-foreground font-rajdhani font-medium relative hover:border-lol-gold/60 transition-all duration-300 pr-[100px]"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="h-10 w-[90px] text-sm leading-tight bg-card/80 backdrop-blur-sm border-lol-gold/30 focus:border-lol-gold text-foreground font-rajdhani font-medium hover:border-lol-gold/60 transition-all duration-300 px-1">
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
                    </SelectContent>
                  </Select>
                </div>
              </div>
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

          {/* Footer */}
          <p className="text-sm text-muted-foreground animate-fade-in font-rajdhani">
            Powered by advanced analytics and AI insights
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
