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
      
      <div className="relative p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse" />
            <Flame className="relative w-7 h-7 text-red-500" />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-wide text-foreground group-hover:text-red-400 transition-colors duration-300">
              The Harsh Truth
            </h3>
            <p className="text-sm font-rajdhani text-muted-foreground">
              Friendly fire incoming... 🔥
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

        {/* Roasts */}
        <div className="space-y-4">
          {roasts.map((roast, index) => (
            <div
              key={index}
              className="group/item p-4 rounded-lg bg-gradient-to-r from-red-500/5 to-orange-500/5 border border-red-500/20 hover:border-red-500/40 hover:from-red-500/10 hover:to-orange-500/10 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 group-hover/item:animate-pulse" />
                <div className="space-y-1 flex-1">
                  <h4 className="font-bebas text-lg tracking-wide text-red-400 group-hover/item:text-red-300 transition-colors">
                    {roast.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/80 font-rajdhani">
                    {roast.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="pt-2 border-t border-red-500/20">
          <p className="text-xs text-center text-muted-foreground font-rajdhani italic">
            All in good fun! Everyone has room to improve. 😄
          </p>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Card>
  );
};
