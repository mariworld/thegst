/**
 * Formats a date in a consistent, user-friendly format
 * @param date Date string or Date object to format
 * @returns Formatted date string (e.g. "April 28, 2023, 02:30 PM")
 */
export const formatDisplayDate = (date: string | Date): string => {
  // Handle cases where date might be null or undefined
  if (!date) {
    return 'Unknown date';
  }
  
  try {
    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      // If the date is already a formatted string, just return it
      if (typeof date === 'string' && !date.includes('T')) {
        return date;
      }
      return 'Invalid date';
    }
    
    // Format date with nice spacing
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

/**
 * Formats a date for database storage (ISO format)
 * @param date Date object to format
 * @returns ISO formatted date string
 */
export const formatDatabaseDate = (date: Date = new Date()): string => {
  return date.toISOString();
}; 