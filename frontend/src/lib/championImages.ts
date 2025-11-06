interface ChampionData {
  name: string;
  image: string;
  link: string;
}

// Cache for champion data
let championImageMap: Map<string, ChampionData> | null = null;
let loadingPromise: Promise<void> | null = null;

// Normalize champion names for matching (remove spaces, lowercase)
const normalizeChampionName = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '');
};

/**
 * Load champion data from public folder
 * Only loads once and caches the result
 */
const loadChampionData = async (): Promise<void> => {
  if (championImageMap) {
    return; // Already loaded
  }

  if (loadingPromise) {
    return loadingPromise; // Already loading
  }

  loadingPromise = (async () => {
    try {
      const response = await fetch('/hero_images.json');
      if (!response.ok) {
        throw new Error('Failed to load champion images');
      }
      const heroImages: ChampionData[] = await response.json();
      
      // Create map for faster lookups
      championImageMap = new Map<string, ChampionData>();
      heroImages.forEach((champion) => {
        championImageMap!.set(normalizeChampionName(champion.name), champion);
      });
    } catch (error) {
      console.error('Error loading champion images:', error);
      championImageMap = new Map(); // Empty map to prevent repeated attempts
    }
  })();

  return loadingPromise;
};

/**
 * Get champion image URL by name
 * @param championName - The champion name (case-insensitive, spaces optional)
 * @returns The image URL or a fallback placeholder
 */
export const getChampionImage = (championName: string): string => {
  // If data is loaded, return immediately
  if (championImageMap) {
    const normalized = normalizeChampionName(championName);
    const champion = championImageMap.get(normalized);
    
    if (champion) {
      return champion.image;
    }
  }
  
  // Fallback to a default placeholder if champion not found or data not loaded
  // The data will be loaded in the background for future calls
  if (!championImageMap) {
    loadChampionData(); // Start loading in background
  }
  
  return 'https://via.placeholder.com/496x560?text=' + encodeURIComponent(championName);
};

/**
 * Get champion data by name
 * @param championName - The champion name
 * @returns The full champion data object or null
 */
export const getChampionData = (championName: string): ChampionData | null => {
  if (!championImageMap) {
    loadChampionData(); // Start loading in background
    return null;
  }
  
  const normalized = normalizeChampionName(championName);
  return championImageMap.get(normalized) || null;
};

/**
 * Check if champion exists in the data
 * @param championName - The champion name
 * @returns True if champion exists
 */
export const championExists = (championName: string): boolean => {
  if (!championImageMap) {
    loadChampionData(); // Start loading in background
    return false;
  }
  
  const normalized = normalizeChampionName(championName);
  return championImageMap.has(normalized);
};

/**
 * Preload champion data
 * Call this early in your app to load champion images in advance
 */
export const preloadChampionImages = async (): Promise<void> => {
  return loadChampionData();
};

// Auto-load when module is imported
loadChampionData();

