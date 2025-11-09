import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface ProPlayerCardProps {
  playerName: string;
  team: string;
  reasoning: string;
}

export const ProPlayerCard = ({ playerName, team, reasoning }: ProPlayerCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl border-lol-gold/40 hover:border-lol-gold/60 transition-all duration-500 group">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-lol-gold/5 via-transparent to-lol-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
      
      <div className="relative p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-lol-gold" />
              <p className="text-sm font-rajdhani font-semibold text-lol-gold tracking-wider uppercase">
                Your Pro Doppelgänger
              </p>
            </div>
            <h3 className="text-4xl font-bebas tracking-wide text-foreground group-hover:text-lol-gold transition-colors duration-300">
              {playerName}
            </h3>
            <p className="text-lg font-rajdhani text-muted-foreground">
              {team}
            </p>
          </div>
          
          {/* Decorative icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-lol-gold/20 blur-xl animate-pulse-gold" />
            <Trophy className="relative w-12 h-12 text-lol-gold/60 group-hover:text-lol-gold group-hover:scale-110 transition-all duration-300" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-lol-gold/40 to-transparent" />

        {/* Reasoning */}
        <div className="space-y-2">
          <p className="text-sm font-rajdhani font-semibold text-muted-foreground uppercase tracking-wider">
            Why You Match
          </p>
          <p className="text-base leading-relaxed text-foreground/90 font-rajdhani">
            {reasoning}
          </p>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lol-gold/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Card>
  );
};
