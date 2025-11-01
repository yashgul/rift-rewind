import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

interface TimelineEvent {
  month: string;
  title: string;
  description: string;
  highlight: string;
  rankChange: string;
}

interface YearlyTimelineProps {
  events: TimelineEvent[];
}

const YearlyTimeline = ({ events }: YearlyTimelineProps) => {
  return (
    <Card className="p-8 bg-gradient-card border-lol-gold/30 hover:border-lol-gold/50 transition-all duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge className="bg-gradient-gold text-primary-foreground font-bold px-4 py-1 text-sm">
            YOUR STORY
          </Badge>
          <h2 className="text-4xl font-display font-bold text-foreground">The 2025 Chronicle</h2>
          <p className="text-muted-foreground">Scroll to explore your journey through the seasons</p>
        </div>

        <ScrollArea className="w-full whitespace-nowrap rounded-lg border border-border bg-lol-dark-elevated p-6">
          <div className="flex gap-6 pb-4">
            {events.map((event, index) => (
              <div
                key={index}
                className="inline-block w-80 shrink-0 relative group"
              >
                <div className="bg-gradient-card rounded-lg p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-glow h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-xl font-bold text-primary">{event.month}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-3">{event.title}</h3>
                  <p className="text-muted-foreground mb-4 whitespace-normal">{event.description}</p>

                  <div className="bg-lol-dark-elevated rounded p-3 mb-3">
                    <p className="text-sm text-muted-foreground mb-1">Highlight</p>
                    <p className="text-foreground font-semibold">{event.highlight}</p>
                  </div>

                  <div className="flex items-center gap-2 bg-gradient-gold/20 rounded p-3 border border-lol-gold/30">
                    {event.rankChange.includes('→') && 
                      event.rankChange.split('→')[0].trim() < event.rankChange.split('→')[1].trim() ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-sm font-semibold text-foreground">{event.rankChange}</span>
                  </div>
                </div>

                {index < events.length - 1 && (
                  <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-0.5 bg-gradient-gold"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </Card>
  );
};

export default YearlyTimeline;
