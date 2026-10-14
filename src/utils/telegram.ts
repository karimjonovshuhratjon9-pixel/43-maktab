export const DEFAULT_TELEGRAM_CHANNEL = 'https://t.me/oltiariq_43_maktab';

export function formatTelegramUrl(input?: string): string {
  if (!input || !input.trim()) {
    return DEFAULT_TELEGRAM_CHANNEL;
  }
  const clean = input.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  if (clean.startsWith('t.me/')) {
    return `https://${clean}`;
  }
  if (clean.startsWith('@')) {
    return `https://t.me/${clean.slice(1)}`;
  }
  return `https://t.me/${clean}`;
}

export function formatTelegramHandle(input?: string): string {
  if (!input || !input.trim()) {
    return '@oltiariq_43_maktab';
  }
  const clean = input
    .trim()
    .replace(/^https?:\/\/(www\.)?t\.me\//i, '')
    .replace(/^@/, '');
  return `@${clean}`;
}
