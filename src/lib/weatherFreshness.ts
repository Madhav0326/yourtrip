/**
 * Weather Freshness Formatting Utility
 * Enforces Guardrail 6: Never imply stale cached weather is live.
 */
export function formatWeatherFreshness(recordedAt?: string, isStale?: boolean): string {
  if (!recordedAt) return 'Freshness unknown';

  const date = new Date(recordedAt);
  if (isNaN(date.getTime())) return 'Freshness unknown';

  const elapsedMs = Date.now() - date.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));

  if (elapsedMinutes < 2) {
    return 'Updated just now';
  }

  if (elapsedMinutes < 60) {
    return isStale ? `Cached ${elapsedMinutes}m ago` : `Updated ${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `Cached ${elapsedHours}h ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `Cached ${elapsedDays}d ago`;
}
