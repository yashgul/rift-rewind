import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, TrendingUp } from "lucide-react";

interface Champion {
  name: string;
  games: number;
  winrate: number;
  kda: number;
  sprite: string;
}

interface TopChampionsProps {
  champions: Champion[];
  hiddenGem: {
    champion: string;
    yourWinrate: number;
    pubWinrate: number;
    differential: number;
    games: number;
  };
}

const TopChampions = ({ champions, hiddenGem }: TopChampionsProps) => {
  return (
    <Card className="p-8 bg-gradient-card border-lol-gold/30 hover:border-lol-gold/50 transition-all duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge className="bg-gradient-gold text-primary-foreground font-bold px-4 py-1 text-sm">
            CHAMPION MASTERY
          </Badge>
          <h2 className="text-4xl font-display font-bold text-foreground">Your Top 3 Champions</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {champions.map((champ, index) => (
            <div
              key={champ.name}
              className="bg-lol-dark-elevated rounded-lg p-6 border border-border hover:border-primary/50 transition-all hover:scale-105 hover:-translate-y-2 duration-300 relative overflow-hidden group"
            >
              {index === 0 && (
                <div className="absolute top-4 right-4">
                  <Trophy className="w-6 h-6 text-lol-gold animate-pulse" />
                </div>
              )}
              
              <div className="flex items-center justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center text-4xl shadow-glow">
                  {/* Placeholder for champion sprite */}
                  🗡️
                </div>
              </div>

              <h3 className="text-2xl font-bold text-center text-foreground mb-4">{champ.name}</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Games</span>
                  <span className="text-foreground font-semibold">{champ.games}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className="text-foreground font-semibold">{champ.winrate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">KDA</span>
                  <span className="text-foreground font-semibold">{champ.kda}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-lol-dark-elevated to-lol-dark-elevated/50 rounded-lg p-6 border border-lol-gold/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-gold opacity-10 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-lol-gold" />
              <h3 className="text-2xl font-bold text-foreground">Hidden Gem</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-3xl font-bold text-foreground mb-2">{hiddenGem.champion}</p>
                <p className="text-muted-foreground">Your secret weapon with incredible success</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-lol-dark-elevated rounded p-3">
                  <span className="text-muted-foreground">Your Winrate</span>
                  <span className="text-2xl font-bold text-green-400">{hiddenGem.yourWinrate}%</span>
                </div>
                <div className="flex items-center justify-between bg-lol-dark-elevated rounded p-3">
                  <span className="text-muted-foreground">Global Average</span>
                  <span className="text-lg font-semibold text-muted-foreground">{hiddenGem.pubWinrate}%</span>
                </div>
                <div className="flex items-center justify-between bg-gradient-gold/20 rounded p-3 border border-lol-gold/30">
                  <span className="text-foreground font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Your Edge
                  </span>
                  <span className="text-2xl font-bold text-lol-gold">+{hiddenGem.differential}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TopChampions;
