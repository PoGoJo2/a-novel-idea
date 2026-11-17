// Start dates are calendar dates (the UTC date part), so they read the same for every reader.
export function formatStart(startDate) {
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return { text: '', past: false };
  const sameYear = d.getUTCFullYear() === new Date().getUTCFullYear();
  const text = new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }), timeZone: 'UTC',
  }).format(d);
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return { text, past: d.getTime() <= todayUtc };
}
