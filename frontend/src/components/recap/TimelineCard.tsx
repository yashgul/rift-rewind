import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Sparkles } from "lucide-react";

const TimelineCard = () => {
  const turningPoints = [
    {
      month: "June",
      event: "Champion Discovery",
      description: "You discovered Yone and everything changed. Your CS/min jumped from 6.2 to 7.8, and you won 18 of your next 25 games.",
      impact: "+320 LP",
    },
    {
      month: "August",
      event: "Playstyle Shift",
      description: "Started prioritizing objectives over kills. Baron control improved by 45%, leading to a 12-game win streak.",
      impact: "+280 LP",
    },
    {
      month: "November",
      event: "Mental Breakthrough",
      description: "Reduced tilt sessions by 67%. Your post-loss winrate improved from 42% to 61%.",
      impact: "+190 LP",
    },
  ];

  return (
    <Card className="p-8 bg-gradient-card border-lol-gold/30">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Badge className="bg-gradient-gold text-primary-foreground font-bold px-4 py-1 text-sm">
            THE TURNING POINT TIMELINE
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">Your Season's Key Moments</h2>
          <p className="text-muted-foreground">
            The pivotal moments that defined your 2025 journey
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-6 pt-6">
          {turningPoints.map((point, index) => (
            <div key={index} className="relative pl-8 pb-6 border-l-2 border-primary/30 last:border-l-0 last:pb-0">
              {/* Timeline dot */}
              <div className="absolute left-0 -translate-x-1/2 top-0">
                <div className="w-4 h-4 rounded-full bg-gradient-gold shadow-glow" />
              </div>

              {/* Content */}
              <div className="bg-lol-dark-elevated rounded-lg p-6 border border-border hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold text-primary">{point.month}</span>
                  </div>
                  <Badge variant="outline" className="bg-gradient-gold text-primary-foreground border-none">
                    {point.impact}
                  </Badge>
                </div>

                <h4 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {point.event}
                </h4>
                <p className="text-muted-foreground leading-relaxed">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TimelineCard;
