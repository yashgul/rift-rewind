import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Swords } from "lucide-react";

const DoppelgangerCard = () => {
  const doppelgangers = [
    { name: "ShadowBlade92", similarity: "94%", rank: "Diamond II" },
    { name: "MidLaneKing", similarity: "91%", rank: "Diamond I" },
    { name: "TheComeback", similarity: "89%", rank: "Platinum I" },
  ];

  const insights = [
    {
      icon: TrendingUp,
      title: "Players like you climb most when they...",
      description: "Focus on scaling champions and prioritize farming over early fights",
    },
    {
      icon: Swords,
      title: "Your doppelgängers excel at...",
      description: "Converting mid-game advantages into Baron control (68% success rate)",
    },
  ];

  return (
    <Card className="p-8 bg-gradient-card border-secondary/30 shadow-blue">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Badge className="bg-gradient-blue text-white font-bold px-4 py-1 text-sm">
            MIRROR MATCH ANALYSIS
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">Your Doppelgänger Finder</h2>
          <p className="text-muted-foreground">
            Players with similar playstyles to yours
          </p>
        </div>

        {/* Doppelgangers */}
        <div className="grid md:grid-cols-3 gap-4">
          {doppelgangers.map((player, index) => (
            <div
              key={index}
              className="bg-lol-dark-elevated rounded-lg p-6 border border-secondary/20 hover:border-secondary/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-secondary group-hover:animate-float" />
                <span className="text-2xl font-bold text-secondary">{player.similarity}</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{player.name}</p>
              <p className="text-sm text-muted-foreground">{player.rank}</p>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="space-y-4 pt-6 border-t border-border">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className="bg-lol-dark-elevated rounded-lg p-6 border border-border hover:border-secondary/30 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gradient-blue rounded-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">{insight.title}</h4>
                    <p className="text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default DoppelgangerCard;
