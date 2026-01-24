/**
 * Formats a date or timestamp as a relative time string (e.g., "2 days ago", "in 3 hours")
 *
 * @param {Date|number} value - Date object or timestamp in milliseconds
 * @returns {string|null} relative time string, or null if value is invalid
 */
export function toRelativeTime(value) {

  const time = typeof value === 'number' ? value : value?.getTime?.();
  if (!Number.isFinite(time)) return null;

  const elapsed = Math.round((time - Date.now()) / 1000);
  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];
  const index = cutoffs.findIndex(seconds => seconds > Math.abs(elapsed));
  const divisor = index ? cutoffs[index - 1] : 1;

  rtf ??= new Intl.RelativeTimeFormat('en', {numeric: 'auto'});
  return rtf.format(Math.trunc(elapsed / divisor), units[index]);
};

let rtf;
