import { Card } from "@/components/ui/card";
import { Sparkles, Lightbulb } from "lucide-react";

interface FunFactsCardProps {
  funFacts: Array<{
    title: string;
    description: string;
  }>;
}

export const FunFactsCard = ({ funFacts }: FunFactsCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl border-[#2196f3]/40 hover:border-[#2196f3]/60 transition-all duration-500 group">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2196f3]/5 via-transparent to-[#00bcd4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#2196f3]/20 to-[#00bcd4]/20 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />
      
      <div className="relative p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
        {/* Header */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-[#2196f3]/20 blur-xl animate-pulse" />
            <Sparkles className="relative w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#2196f3]" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-wide text-foreground group-hover:text-[#2196f3] transition-colors duration-300">
              Fun Facts
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              The numbers don't lie... ✨
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#2196f3]/40 to-transparent" />

        {/* Fun Facts */}
        <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
          {funFacts.map((fact, index) => (
            <div
              key={index}
              className="group/item p-2 sm:p-2.5 lg:p-3 rounded-lg bg-gradient-to-r from-[#2196f3]/5 to-[#00bcd4]/5 border border-[#2196f3]/20 hover:border-[#2196f3]/40 hover:from-[#2196f3]/10 hover:to-[#00bcd4]/10 transition-all duration-300"
            >
              <div className="flex items-start gap-1.5 sm:gap-2">
                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-[#2196f3] flex-shrink-0 mt-0.5 group-hover/item:animate-pulse" />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-bold tracking-wide text-[#2196f3] group-hover/item:text-[#00bcd4] transition-colors">
                    {fact.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs lg:text-sm leading-snug text-foreground/90">
                    {fact.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="pt-1 sm:pt-1.5 border-t border-[#2196f3]/20">
          <p className="text-[9px] sm:text-[10px] text-center text-muted-foreground italic">
            Every match tells a story. 📊
          </p>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2196f3]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Card>
  );
};
