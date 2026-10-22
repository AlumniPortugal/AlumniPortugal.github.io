const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'always' });
const units = [
  ['month', 30 * 24 * 60],
  ['week', 7 * 24 * 60],
  ['day', 24 * 60],
  ['hour', 60],
  ['minute', 1],
] as const;

export function formatPostedAgo(date: string, now = Date.now()): string {
  const minutes = Math.max(1, Math.floor((now - Date.parse(date)) / 60_000));
  for (const [unit, size] of units) {
    if (minutes >= size) return relativeTime.format(-Math.floor(minutes / size), unit);
  }
  return relativeTime.format(-1, 'minute');
}
