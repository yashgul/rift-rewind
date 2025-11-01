import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface PersonalityRadarProps {
  personality: {
    aiDescription: string;
    traits: {
      aggression: number;
      teamwork: number;
      mechanics: number;
      strategy: number;
      consistency: number;
    };
  };
}

const PersonalityRadar = ({ personality }: PersonalityRadarProps) => {
  const chartData = [
    { trait: "Aggression", value: personality.traits.aggression },
    { trait: "Teamwork", value: personality.traits.teamwork },
    { trait: "Mechanics", value: personality.traits.mechanics },
    { trait: "Strategy", value: personality.traits.strategy },
    { trait: "Consistency", value: personality.traits.consistency },
  ];

  return (
    <Card className="p-8 bg-gradient-card border-lol-gold/30 hover:border-lol-gold/50 transition-all duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge className="bg-gradient-gold text-primary-foreground font-bold px-4 py-1 text-sm">
            PERSONALITY MATRIX
          </Badge>
          <h2 className="text-4xl font-display font-bold text-foreground">Your Playstyle DNA</h2>
        </div>

        <div className="bg-lol-dark-elevated rounded-lg p-6 border border-lol-gold/20">
          <p className="text-lg text-foreground leading-relaxed italic">
            "{personality.aiDescription}"
          </p>
          <p className="text-sm text-muted-foreground mt-2">— AI Analysis</p>
        </div>

        <div className="bg-lol-dark-elevated rounded-lg p-6 border border-border">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="trait" 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 14, fontWeight: 600 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Radar 
                name="Your Stats" 
                dataKey="value" 
                stroke="hsl(var(--lol-gold))" 
                fill="hsl(var(--lol-gold))" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default PersonalityRadar;
