import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface ProPlayerCardProps {
  playerName: string;
  reasoning: string;
}

export const ProPlayerCard = ({ playerName, reasoning }: ProPlayerCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl border-lol-gold/40 hover:border-lol-gold/60 transition-all duration-500 group">
      {/* Animated background gradient - Reference for hover effect used throughout Recap.tsx */}
      <div className="absolute inset-0 bg-gradient-to-br from-lol-gold/5 via-transparent to-lol-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect - Reference for hover effect used throughout Recap.tsx */}
      <div className="absolute -inset-1 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
      
      <div className="relative p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-lol-gold" />
              <p className="text-[10px] sm:text-xs font-rajdhani font-semibold text-lol-gold tracking-wider uppercase">
                Your Pro Doppelgänger
              </p>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bebas tracking-wide text-foreground group-hover:text-lol-gold transition-colors duration-300">
              {playerName}
            </h3>
          </div>
          
          {/* Decorative icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-lol-gold/20 blur-xl animate-pulse-gold" />
            <Trophy className="relative w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-lol-gold/60 group-hover:text-lol-gold group-hover:scale-110 transition-all duration-300" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-lol-gold/40 to-transparent" />

        {/* Reasoning */}
        <div className="space-y-0.5 sm:space-y-1">
          <p className="text-[10px] sm:text-xs font-rajdhani font-semibold text-muted-foreground uppercase tracking-wider">
            Why You Match
          </p>
          <p className="text-xs sm:text-sm leading-snug text-foreground/90 font-rajdhani line-clamp-3 lg:line-clamp-4">
            {reasoning}
          </p>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lol-gold/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Card>
  );
};
