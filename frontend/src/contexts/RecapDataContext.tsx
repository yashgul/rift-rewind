import { createContext, useContext, useState, ReactNode } from 'react';

interface RecapDataCache {
  [key: string]: any; // key format: "name_tag_region"
}

interface ComparisonCache {
  players: {
    player1: any;
    player2: any;
  };
  comparison: any;
  searchParams: string; // to track which comparison is cached
}

interface RecapDataContextType {
  getCachedRecap: (name: string, tag: string, region: string) => any;
  setCachedRecap: (name: string, tag: string, region: string, data: any) => void;
  getComparisonCache: () => ComparisonCache | null;
  setComparisonCache: (data: ComparisonCache) => void;
  clearCache: () => void;
}

const RecapDataContext = createContext<RecapDataContextType | undefined>(undefined);

export function RecapDataProvider({ children }: { children: ReactNode }) {
  const [recapCache, setRecapCache] = useState<RecapDataCache>({});
  const [comparisonCache, setComparisonCacheState] = useState<ComparisonCache | null>(null);

  const getCachedRecap = (name: string, tag: string, region: string) => {
    const key = `${name.toLowerCase()}_${tag.toLowerCase()}_${region.toLowerCase()}`;
    return recapCache[key] || null;
  };

  const setCachedRecap = (name: string, tag: string, region: string, data: any) => {
    const key = `${name.toLowerCase()}_${tag.toLowerCase()}_${region.toLowerCase()}`;
    setRecapCache(prev => ({
      ...prev,
      [key]: data
    }));
  };

  const getComparisonCache = () => {
    return comparisonCache;
  };

  const setComparisonCache = (data: ComparisonCache) => {
    setComparisonCacheState(data);
    
    // Also cache individual player data for quick access
    if (data.players.player1) {
      const [name1, tag1] = data.players.player1.name.split('#');
      setCachedRecap(name1, tag1, data.players.player1.region, {
        wrapped: data.players.player1.wrapped,
        stats: data.players.player1.stats,
        wrapped_info: data.players.player1.wrapped_info
      });
    }
    
    if (data.players.player2) {
      const [name2, tag2] = data.players.player2.name.split('#');
      setCachedRecap(name2, tag2, data.players.player2.region, {
        wrapped: data.players.player2.wrapped,
        stats: data.players.player2.stats,
        wrapped_info: data.players.player2.wrapped_info
      });
    }
  };

  const clearCache = () => {
    setRecapCache({});
    setComparisonCacheState(null);
  };

  return (
    <RecapDataContext.Provider
      value={{
        getCachedRecap,
        setCachedRecap,
        getComparisonCache,
        setComparisonCache,
        clearCache
      }}
    >
      {children}
    </RecapDataContext.Provider>
  );
}

export function useRecapData() {
  const context = useContext(RecapDataContext);
  if (!context) {
    throw new Error('useRecapData must be used within RecapDataProvider');
  }
  return context;
}
