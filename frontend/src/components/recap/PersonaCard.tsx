import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Target } from "lucide-react";

interface PersonaCardProps {
  username: string;
}

const PersonaCard = ({ username }: PersonaCardProps) => {
  // Mock data - would come from API
  const persona = {
    archetype: "The Comeback Catalyst",
    description: "You thrive in adversity. When the odds are stacked against you, that's when you shine brightest. Your ability to remain calm and find opportunities in desperate situations makes you a formidable opponent.",
    traits: [
      { label: "Late Game Focus", value: "92%", icon: Trophy },
      { label: "Clutch Factor", value: "88%", icon: Zap },
      { label: "Objective Control", value: "85%", icon: Target },
    ],
    achievements: [
      "Most Comebacks (23 games)",
      "Highest Winrate When Behind",
      "Baron Steals Master (12 successful steals)",
    ],
  };

  return (
    <Card className="p-8 bg-gradient-card border-lol-gold/30 shadow-gold">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Badge className="bg-gradient-gold text-primary-foreground font-bold px-4 py-1 text-sm">
            YOUR LEAGUE PERSONA
          </Badge>
          <h2 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            {persona.archetype}
          </h2>
        </div>

        {/* Description */}
        <p className="text-foreground/90 text-lg leading-relaxed text-center max-w-2xl mx-auto">
          {persona.description}
        </p>

        {/* Traits */}
        <div className="grid md:grid-cols-3 gap-6 pt-6">
          {persona.traits.map((trait, index) => {
            const Icon = trait.icon;
            return (
              <div
                key={index}
                className="bg-lol-dark-elevated rounded-lg p-6 border border-border hover:border-primary/50 transition-all group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-gradient-gold rounded-full group-hover:animate-float">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{trait.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{trait.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Achievements */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-xl font-semibold text-foreground mb-4">Signature Achievements</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {persona.achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-lol-dark-elevated rounded-lg p-4 border border-lol-gold/20 hover:border-lol-gold/50 transition-colors"
              >
                <p className="text-sm text-foreground/90 font-medium">{achievement}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaCard;
