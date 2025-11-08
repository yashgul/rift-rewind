/**
 * Converts a time string from ET (Eastern Time) to the appropriate timezone based on region
 * @param timeString - Time string in format "HH:MM AM/PM ET"
 * @param region - Region code (americas, europe, asia, sea, etc.)
 * @returns Localized time string with appropriate timezone
 */
export function convertPeakTimeToRegion(timeString: string, region: string): string {
  if (!timeString || timeString === 'N/A') return 'N/A';

  // Region to timezone mapping
  const regionTimezones: Record<string, { timezone: string; label: string }> = {
    americas: { timezone: 'America/New_York', label: 'ET' },
    europe: { timezone: 'Europe/London', label: 'GMT' },
    asia: { timezone: 'Asia/Seoul', label: 'KST' }, // Korea Standard Time
    sea: { timezone: 'Asia/Singapore', label: 'SGT' },
    oceania: { timezone: 'Australia/Sydney', label: 'AEDT' },
  };

  // Get the appropriate timezone for the region, default to ET
  const targetTimezone = regionTimezones[region.toLowerCase()] || regionTimezones.americas;

  try {
    // Parse the input time (assumed to be in ET)
    const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return timeString;

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    // Create a date object in ET timezone
    // Using a fixed date to avoid DST issues - just need the time conversion
    const etDate = new Date();
    etDate.setHours(hours, minutes, 0, 0);

    // Format the time for the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: targetTimezone.timezone,
    });

    const localizedTime = formatter.format(etDate);
    
    // Return with the timezone label
    return `${localizedTime} ${targetTimezone.label}`;
  } catch (error) {
    console.error('Error converting time:', error);
    return timeString; // Return original if conversion fails
  }
}

/**
 * Get timezone label for a given region
 * @param region - Region code
 * @returns Timezone label (e.g., "KST", "GMT", "ET")
 */
export function getRegionTimezoneLabel(region: string): string {
  const timezoneLabels: Record<string, string> = {
    americas: 'ET',
    europe: 'GMT',
    asia: 'KST',
    sea: 'SGT',
    oceania: 'AEDT',
  };

  return timezoneLabels[region.toLowerCase()] || 'ET';
}
