import { useState } from "react";

interface ItemIconProps {
  itemId: number;
  itemName: string | null;
}

/**
 * ItemIcon component with error handling for missing/removed items
 * Hides the item if the image fails to load (403 or 404 errors)
 */
export const ItemIcon = ({ itemId, itemName }: ItemIconProps) => {
  const [imageLoaded, setImageLoaded] = useState(true);

  // Don't render if image failed to load
  if (!imageLoaded) return null;

  return (
    <div
      className="group/item relative"
      title={itemName || undefined}
    >
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/${itemId}.png`}
        alt={itemName || `Item ${itemId}`}
        className="w-12 h-12 rounded border-2 border-[#785a28]/60 hover:border-[#c89b3c] transition-all duration-200 hover:scale-110"
        draggable="false"
        onError={() => {
          console.warn(`Failed to load item image for ID: ${itemId}`);
          setImageLoaded(false);
        }}
      />
      {/* Tooltip on hover */}
      {itemName && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#0a1428] border border-[#c89b3c] rounded-md opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
          <p className="text-xs font-medium text-[#d1c6ac]">{itemName}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#c89b3c]"></div>
        </div>
      )}
    </div>
  );
};
