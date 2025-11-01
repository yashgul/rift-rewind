import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sword, Flame, Eye, Star, Heart } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
}

interface AchievementsGridProps {
  achievements: Achievement[];
}

const AchievementsGrid = ({ achievements }: AchievementsGridProps) => {
  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      trophy: Trophy,
      sword: Sword,
      flame: Flame,
      eye: Eye,
      star: Star,
      heart: Heart,
    };
    const Icon = icons[iconName] || Trophy;
    return <Icon className="w-8 h-8" />;
  };

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      legendary: "from-yellow-400 to-orange-500",
      epic: "from-purple-400 to-pink-500",
      rare: "from-blue-400 to-cyan-500",
    };
    return colors[rarity] || colors.rare;
  };

  return (
    <Card className="p-8 bg-gradient-card border-lol-gold/30 hover:border-lol-gold/50 transition-all duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge className="bg-gradient-gold text-primary-foreground font-bold px-4 py-1 text-sm">
            HALL OF FAME
          </Badge>
          <h2 className="text-4xl font-display font-bold text-foreground">Your Achievements</h2>
          <p className="text-muted-foreground">The moments that defined your greatness</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-lol-dark-elevated rounded-lg p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2 relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity`}></div>
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRarityColor(achievement.rarity)} flex items-center justify-center text-white mb-4 shadow-glow`}>
                  {getIcon(achievement.icon)}
                </div>

                <Badge 
                  variant="outline" 
                  className={`mb-3 border-0 bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white font-semibold text-xs`}
                >
                  {achievement.rarity.toUpperCase()}
                </Badge>

                <h3 className="text-xl font-bold text-foreground mb-2">{achievement.title}</h3>
                <p className="text-muted-foreground text-sm">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default AchievementsGrid;
