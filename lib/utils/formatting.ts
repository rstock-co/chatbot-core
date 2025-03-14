/**
 * Truncates a string to the specified length
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length) + '...';
}

/**
 * Formats a timestamp to a human-readable string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Formats a message content for display
 * This is a simple implementation that could be extended for markdown, etc.
 */
export function formatMessageContent(content: string): string {
  // Simple implementation - just return the content
  // In a real implementation, you might parse markdown, handle links, etc.
  return content;
}
