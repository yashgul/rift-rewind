import { Card } from "@/components/ui/card";
import { Flame, AlertCircle } from "lucide-react";

interface RoastsCardProps {
  roasts: Array<{
    title: string;
    description: string;
  }>;
}

export const RoastsCard = ({ roasts }: RoastsCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl border-red-500/40 hover:border-red-500/60 transition-all duration-500 group">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />
      
      <div className="relative p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
        {/* Header */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse" />
            <Flame className="relative w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bebas tracking-wide text-foreground group-hover:text-red-400 transition-colors duration-300">
              The Harsh Truth
            </h3>
            <p className="text-[10px] sm:text-xs font-rajdhani text-muted-foreground">
              Friendly fire incoming... 🔥
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

        {/* Roasts */}
        <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
          {roasts.map((roast, index) => (
            <div
              key={index}
              className="group/item p-2 sm:p-2.5 lg:p-3 rounded-lg bg-gradient-to-r from-red-500/5 to-orange-500/5 border border-red-500/20 hover:border-red-500/40 hover:from-red-500/10 hover:to-orange-500/10 transition-all duration-300"
            >
              <div className="flex items-start gap-1.5 sm:gap-2">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0 mt-0.5 group-hover/item:animate-pulse" />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h4 className="font-bebas text-sm sm:text-base tracking-wide text-red-400 group-hover/item:text-red-300 transition-colors">
                    {roast.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs leading-snug text-foreground/80 font-rajdhani line-clamp-2">
                    {roast.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="pt-1 sm:pt-1.5 border-t border-red-500/20">
          <p className="text-[9px] sm:text-[10px] text-center text-muted-foreground font-rajdhani italic">
            All in good fun! Everyone has room to improve. 😄
          </p>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Card>
  );
};
