interface ProPlayerCardProps {
  playerName: string;
  reasoning: string;
}

export const ProPlayerCard = ({ playerName, reasoning }: ProPlayerCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-sm border border-[#785a28] bg-[#0b1426]/90 p-2.5 sm:p-3 lg:p-4 hover:border-[#c89b3c] transition-all duration-500">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#c89b3c]/5 via-transparent to-[#2196f3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#c89b3c] to-[#d8ac4d] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
      
      <div className="relative">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c89b3c]/70 sm:text-xs">YOUR PRO DOPPELGÄNGER</p>
        <div className="mt-1.5 sm:mt-2 space-y-1.5 sm:space-y-2">
          <div>
            <p className="text-base font-bold text-white sm:text-lg lg:text-xl group-hover:text-[#c89b3c] transition-colors duration-300">
              {playerName}
            </p>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#785a28]/40 to-transparent" />
          
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#a09b8c] mb-0.5 sm:mb-1">
              Why You Match
            </p>
            <p className="text-[10px] sm:text-xs leading-snug text-[#d1c6ac]">
              {reasoning}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
