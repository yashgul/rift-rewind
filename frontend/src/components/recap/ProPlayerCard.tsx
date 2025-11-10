import { Users } from "lucide-react";

interface ProPlayerCardProps {
  playerName: string;
  reasoning: string;
}

export const ProPlayerCard = ({ playerName, reasoning }: ProPlayerCardProps) => {
  // Split reasoning into bullet points if it contains bullet characters
  let bulletPoints = reasoning.split('\n').filter(line => line.trim().length > 0);
  let hasBullets = bulletPoints.some(point => point.trim().startsWith('•'));

  // If no bullets found, try to split by sentences and create bullet points
  if (!hasBullets && reasoning.length > 50) {
    // Split by sentence endings, but try to keep related content together
    const sentences = reasoning.split(/\.\s+/).filter(s => s.trim().length > 0);
    if (sentences.length > 1) {
      bulletPoints = sentences.map(s => s.trim() + (s.endsWith('.') ? '' : '.'));
      hasBullets = true; // Force bullet display
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-sm border border-[#785a28] bg-[#0b1426]/90 p-2.5 sm:p-3 lg:p-4 hover:border-[#c89b3c] transition-all duration-500">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#c89b3c]/5 via-transparent to-[#2196f3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#c89b3c] to-[#d8ac4d] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-4 w-4 text-[#c89b3c]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c89b3c]/70 sm:text-xs">YOUR PRO DOPPELGÄNGER</p>
        </div>
        <div className="mt-1.5 sm:mt-2 space-y-1.5 sm:space-y-2">
          <div>
            <p className="text-base font-bold text-white sm:text-lg lg:text-xl group-hover:text-[#c89b3c] transition-colors duration-300">
              {playerName}
            </p>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#785a28]/40 to-transparent" />
          
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#a09b8c] mb-1 sm:mb-1.5">
              Why You Match
            </p>
            {hasBullets ? (
              <ul className="space-y-1">
                {bulletPoints.map((point, index) => {
                  const cleanPoint = point.trim().replace(/^•\s*/, '');
                  if (!cleanPoint) return null;
                  return (
                    <li key={index} className="flex items-start gap-1.5">
                      <span className="text-[#c89b3c] mt-0.5 shrink-0">•</span>
                      <span className="text-[10px] sm:text-xs leading-snug text-[#d1c6ac]">
                        {cleanPoint}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-[10px] sm:text-xs leading-snug text-[#d1c6ac]">
                {reasoning}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
