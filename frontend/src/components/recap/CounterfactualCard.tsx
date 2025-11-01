import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, TrendingUp, AlertCircle } from "lucide-react";

const CounterfactualCard = () => {
  const scenarios = [
    {
      question: "What if you only played your top 3 champions?",
      result: "Platinum I → Diamond II",
      impact: "+450 LP",
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      question: "What if you banned X instead of Y?",
      result: "12% higher winrate",
      impact: "+8 wins",
      icon: AlertCircle,
      color: "text-secondary",
    },
    {
      question: "What if you played more after winning?",
      result: "68% → 72% winrate streak",
      impact: "+6 wins",
      icon: GitBranch,
      color: "text-primary",
    },
  ];

  return (
    <Card className="p-8 bg-gradient-card border-secondary/30 shadow-blue">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Badge className="bg-gradient-blue text-white font-bold px-4 py-1 text-sm">
            GHOST OF GAMES PAST
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">Counterfactual Analysis</h2>
          <p className="text-muted-foreground">
            What could have been? AI-powered "what if" scenarios
          </p>
        </div>

        {/* Scenarios */}
        <div className="space-y-4 pt-4">
          {scenarios.map((scenario, index) => {
            const Icon = scenario.icon;
            return (
              <div
                key={index}
                className="bg-lol-dark-elevated rounded-lg p-6 border border-border hover:border-secondary/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <div className="p-3 bg-lol-dark rounded-lg border border-border group-hover:border-secondary/50 transition-colors">
                      <Icon className={`w-6 h-6 ${scenario.color}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-foreground mb-3">
                      {scenario.question}
                    </h4>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="bg-lol-dark px-4 py-2 rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground mb-1">Projected Result</p>
                        <p className="text-lg font-bold text-foreground">{scenario.result}</p>
                      </div>
                      <div className="bg-gradient-gold px-4 py-2 rounded-lg">
                        <p className="text-sm text-primary-foreground/80 mb-1">Impact</p>
                        <p className="text-lg font-bold text-primary-foreground">{scenario.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Insights */}
        <div className="bg-lol-dark-elevated rounded-lg p-6 border border-secondary/20 mt-6">
          <p className="text-foreground/90 leading-relaxed">
            <span className="font-semibold text-secondary">AI Insight:</span> Your champion pool management
            is your biggest opportunity for improvement. Focusing on mastery over variety could accelerate
            your climb significantly in the next season.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CounterfactualCard;
