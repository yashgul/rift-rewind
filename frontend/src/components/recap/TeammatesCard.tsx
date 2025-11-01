import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Award } from "lucide-react";

interface Teammate {
  name: string;
  games: number;
  winrate: number;
  favoriteRole: string;
  synergy: string;
  bestCombo: string;
}

interface TeammatesCardProps {
  teammates: Teammate[];
}

const TeammatesCard = ({ teammates }: TeammatesCardProps) => {
  return (
    <Card className="p-8 bg-gradient-card border-lol-gold/30 hover:border-lol-gold/50 transition-all duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge className="bg-gradient-gold text-primary-foreground font-bold px-4 py-1 text-sm">
            YOUR SQUAD
          </Badge>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h2 className="text-4xl font-display font-bold text-foreground">Most Frequent Teammates</h2>
          </div>
          <p className="text-muted-foreground">The ones who shared your victories and defeats</p>
        </div>

        <div className="space-y-4">
          {teammates.map((teammate, index) => (
            <div
              key={index}
              className={`bg-lol-dark-elevated rounded-lg p-6 border transition-all duration-300 hover:scale-102 ${
                teammate.winrate >= 60 
                  ? 'border-green-500/30 hover:border-green-500/50' 
                  : teammate.winrate >= 50
                  ? 'border-border hover:border-primary/50'
                  : 'border-red-500/30 hover:border-red-500/50'
              }`}
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-2xl shadow-glow">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{teammate.name}</h3>
                      <p className="text-sm text-muted-foreground">{teammate.favoriteRole}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Games Together</span>
                      <span className="text-foreground font-semibold">{teammate.games}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Win Rate</span>
                      <span className={`font-semibold ${
                        teammate.winrate >= 60 ? 'text-green-400' : 
                        teammate.winrate >= 50 ? 'text-foreground' : 'text-red-400'
                      }`}>
                        {teammate.winrate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="bg-gradient-card rounded-lg p-4 border border-lol-gold/20 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">Synergy Analysis</span>
                    </div>
                    <p className="text-muted-foreground text-sm italic">"{teammate.synergy}"</p>
                  </div>

                  <div className="flex items-center gap-2 bg-lol-dark-elevated rounded p-3 border border-border">
                    <Award className="w-5 h-5 text-lol-gold" />
                    <span className="text-sm text-muted-foreground">Best Combo:</span>
                    <span className="text-sm font-semibold text-foreground">{teammate.bestCombo}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TeammatesCard;
