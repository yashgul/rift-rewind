import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Gamepad2 } from "lucide-react";

interface BasicStatsCardProps {
  stats: {
    wins: number;
    losses: number;
    totalGames: number;
    lpGained: number;
    lpLost: number;
    peakRank: string;
    currentRank: string;
    favoriteRole: string;
  };
}

const BasicStatsCard = ({ stats }: BasicStatsCardProps) => {
  const winrate = ((stats.wins / stats.totalGames) * 100).toFixed(1);
  const netLP = stats.lpGained - stats.lpLost;

  return (
    <Card className="p-8 bg-gradient-card border-lol-gold/30 hover:border-lol-gold/50 transition-all duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge className="bg-gradient-gold text-primary-foreground font-bold px-4 py-1 text-sm">
            SEASON OVERVIEW
          </Badge>
          <h2 className="text-4xl font-display font-bold text-foreground">Your 2025 Journey</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-lol-dark-elevated rounded-lg p-4 border border-border hover:border-primary/50 transition-all hover:scale-105">
            <div className="flex items-center gap-2 mb-2">
              <Gamepad2 className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground text-sm">Total Games</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.totalGames}</p>
          </div>

          <div className="bg-lol-dark-elevated rounded-lg p-4 border border-border hover:border-primary/50 transition-all hover:scale-105">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-lol-gold" />
              <span className="text-muted-foreground text-sm">Win Rate</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">{winrate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.wins}W - {stats.losses}L</p>
          </div>

          <div className="bg-lol-dark-elevated rounded-lg p-4 border border-border hover:border-primary/50 transition-all hover:scale-105">
            <div className="flex items-center gap-2 mb-2">
              {netLP >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className="text-muted-foreground text-sm">Net LP</span>
            </div>
            <p className={`text-3xl font-bold ${netLP >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netLP >= 0 ? '+' : ''}{netLP}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.lpGained} / -{stats.lpLost}
            </p>
          </div>

          <div className="bg-lol-dark-elevated rounded-lg p-4 border border-border hover:border-primary/50 transition-all hover:scale-105">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground text-sm">Peak Rank</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.peakRank}</p>
            <p className="text-xs text-muted-foreground mt-1">Ended: {stats.currentRank}</p>
          </div>
        </div>

        <div className="bg-lol-dark-elevated rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Favorite Role</p>
              <p className="text-2xl font-bold text-foreground">{stats.favoriteRole}</p>
            </div>
            <div className="text-6xl">🎯</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BasicStatsCard;
