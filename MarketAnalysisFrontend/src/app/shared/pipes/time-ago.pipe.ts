import { Pipe, PipeTransform } from '@angular/core';

/**
 * TimeAgoPipe
 *
 * Converts dates to human-readable relative time strings
 *
 * Usage: {{ date | timeAgo }}
 *
 * Examples:
 * - 30 seconds ago => "Just now"
 * - 5 minutes ago => "5 minutes ago"
 * - 2 hours ago => "2 hours ago"
 * - 3 days ago => "3 days ago"
 * - 2 months ago => "2 months ago"
 * - 1 year ago => "1 year ago"
 */
@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  /**
   * Transform date to relative time string
   * @param value Date string or Date object
   * @returns Human-readable relative time
   */
  transform(value: string | Date): string {
    if (!value) return 'Unknown';

    const now = new Date();
    const past = new Date(value);
    const diffMs = now.getTime() - past.getTime();

    // Calculate time units
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    // Return most appropriate time unit
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

    return 'Just now';
  }
}
