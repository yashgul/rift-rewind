import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, Gamepad2 } from "lucide-react";

const DuoCard = () => {
  const duoPartners = [
    {
      name: "JungleMain99",
      winrate: "68%",
      games: 47,
      synergy: "Excellent",
      bestCombo: "You (Thresh) + Them (Jinx): 12-3",
      insight: "You play 23% more aggressively together, taking 4.2 more fights per game",
    },
    {
      name: "TopLaneLegend",
      winrate: "61%",
      games: 32,
      synergy: "Great",
      bestCombo: "You (Leona) + Them (Jax): 9-4",
      insight: "Your engage timing syncs perfectly, with 89% follow-up rate on your initiations",
    },
  ];

  return (
    <Card className="p-8 bg-gradient-card border-lol-gold/30 shadow-gold">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Badge className="bg-gradient-gold text-primary-foreground font-bold px-4 py-1 text-sm">
            DUO COMPATIBILITY REPORTS
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">Your Best Partners</h2>
          <p className="text-muted-foreground">
            Analyzing your synergy with duo partners
          </p>
        </div>

        {/* Partners */}
        <div className="space-y-6 pt-4">
          {duoPartners.map((partner, index) => (
            <div
              key={index}
              className="bg-lol-dark-elevated rounded-lg p-6 border border-border hover:border-primary/50 transition-all"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-gold rounded-lg">
                      <Users className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground">{partner.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Heart className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {partner.synergy} Synergy
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{partner.winrate}</p>
                    <p className="text-sm text-muted-foreground">{partner.games} games</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-lol-dark rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Gamepad2 className="w-4 h-4 text-secondary" />
                      <p className="text-sm font-semibold text-foreground">Best Combo</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{partner.bestCombo}</p>
                  </div>
                  <div className="bg-lol-dark rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">Playstyle Impact</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{partner.insight}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Share prompt */}
        <div className="bg-lol-dark-elevated rounded-lg p-6 border border-primary/20 mt-6 text-center">
          <p className="text-foreground/90">
            <span className="font-semibold text-primary">Pro Tip:</span> Share your duo compatibility
            report with your partners to optimize your team strategies for Season 2026!
          </p>
        </div>
      </div>
    </Card>
  );
};

export default DuoCard;
