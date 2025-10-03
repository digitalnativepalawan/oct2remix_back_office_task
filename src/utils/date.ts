

const isValidDate = (d: Date) => !isNaN(d.getTime());

/**
 * Formats a date string into a relative time string (e.g., "Today", "Yesterday", "3 days ago").
 * Falls back to a short date format for dates older than a week or in the future.
 * @param dateString - The ISO date string to format.
 * @returns A formatted relative date string.
 */
export function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    if (!isValidDate(date)) return 'Invalid Date';
    
    const now = new Date();
    // Reset time components for accurate day difference calculation
    now.setHours(0, 0, 0, 0);
    const dateToCompare = new Date(dateString);
    dateToCompare.setHours(0, 0, 0, 0);

    const diffInMs = now.getTime() - dateToCompare.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays === 0) {
        return 'Today';
    }
    if (diffInDays === 1) {
        return 'Yesterday';
    }
    if (diffInDays > 1 && diffInDays < 7) {
        return `${Math.floor(diffInDays)} days ago`;
    }
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}


/**
 * Formats a date string into a display-friendly format (e.g., "October 27, 2023").
 * @param dateString - The ISO date string to format.
 * @returns A formatted display date string.
 */
export function formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    if (!isValidDate(date)) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Formats a timestamp string for display in comments (e.g., "10/27/23, 5:30 PM").
 * @param timestampString - The ISO timestamp string to format.
 * @returns A formatted timestamp string.
 */
export function formatCommentTimestamp(timestampString: string): string {
     const date = new Date(timestampString);
     if (!isValidDate(date)) return 'Invalid Timestamp';
     return date.toLocaleString('en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
     });
}