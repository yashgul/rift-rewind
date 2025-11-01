import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Laugh } from "lucide-react";

interface EmbarrassingFact {
  title: string;
  description: string;
  severity: string;
}

interface EmbarrassingFactsProps {
  facts: EmbarrassingFact[];
}

const EmbarrassingFacts = ({ facts }: EmbarrassingFactsProps) => {
  return (
    <Card className="p-8 bg-gradient-card border-red-500/30 hover:border-red-500/50 transition-all duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold px-4 py-1 text-sm">
            REALITY CHECK
          </Badge>
          <div className="flex items-center gap-3">
            <Laugh className="w-8 h-8 text-red-400" />
            <h2 className="text-4xl font-display font-bold text-foreground">The Bloopers Reel</h2>
          </div>
          <p className="text-muted-foreground">We all have our... moments 😅</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {facts.map((fact, index) => (
            <div
              key={index}
              className={`bg-lol-dark-elevated rounded-lg p-6 border transition-all duration-300 hover:scale-105 ${
                fact.severity === 'high' 
                  ? 'border-red-500/30 hover:border-red-500/50' 
                  : 'border-orange-500/30 hover:border-orange-500/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  fact.severity === 'high' 
                    ? 'bg-red-500/20' 
                    : 'bg-orange-500/20'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    fact.severity === 'high' 
                      ? 'text-red-400' 
                      : 'text-orange-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{fact.title}</h3>
                  <p className="text-muted-foreground text-sm">{fact.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-lol-dark-elevated rounded-lg p-6 border border-border text-center">
          <p className="text-muted-foreground italic">
            "Every legend has their humble moments. What matters is learning from them!" 💪
          </p>
        </div>
      </div>
    </Card>
  );
};

export default EmbarrassingFacts;
