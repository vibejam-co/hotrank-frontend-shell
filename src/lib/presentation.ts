import type { Clip, Creator, Movement } from '../types';

const FALLBACK_PALETTE = ['#241321', '#18232a', '#22221c', '#171b2b', '#2b1d1d'];

export function cleanText(value: unknown, fallback = ''): string {
  const text = String(value ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/[*_>`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text || fallback;
}

export function truncateText(value: unknown, max: number, fallback = ''): string {
  const text = cleanText(value, fallback);
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function fallbackArtwork(id: string, label = 'HOTRANK'): string {
  const index = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % FALLBACK_PALETTE.length;
  const color = FALLBACK_PALETTE[index];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="${color}"/><circle cx="920" cy="180" r="260" fill="#e9439a" opacity=".16"/><path d="M0 680 420 420l220 100 210-170 350 230v220H0Z" fill="#050505" opacity=".66"/><text x="72" y="700" fill="#f3efe9" font-family="Georgia,serif" font-size="56" letter-spacing="6">${cleanText(label, 'HOTRANK').slice(0, 18)}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function safeImage(value: unknown, id: string, label?: string): string {
  const candidate = cleanText(value);
  return candidate || fallbackArtwork(id, label);
}

export function safeCount(value: unknown, fallback = ''): string {
  const text = cleanText(value);
  if (!text || /^0(?:\.0+)?(?:k|m)?$/i.test(text) || text === '00:00') return fallback;
  return text;
}

export function movementLabel(movement: Movement, change: unknown): string {
  const amount = Number(change);
  return (movement === 'up' || movement === 'down') && Number.isFinite(amount) && amount > 0 ? String(amount) : '';
}

export function presentCreator(input: Creator): Creator {
  const id = cleanText(input.id, 'creator');
  return {
    ...input,
    id,
    name: truncateText(input.name, 52, 'Anonymous creator'),
    handle: cleanText(input.handle, 'anonymous'),
    avatar: safeImage(input.avatar, `avatar-${id}`, 'HOTRANK'),
    bio: truncateText(input.bio, 180, 'A creator on HOTRANK.'),
    followers: safeCount(input.followers),
    rank: Number.isFinite(Number(input.rank)) && Number(input.rank) > 0 ? Number(input.rank) : 0,
    clips: Number.isFinite(Number(input.clips)) && Number(input.clips) > 0 ? Number(input.clips) : 0,
  };
}

export function presentClip(input: Clip): Clip {
  const id = cleanText(input.id, 'clip');
  return {
    ...input,
    id,
    title: truncateText(input.title, 92, 'Untitled clip'),
    image: safeImage(input.image, id, 'HOTRANK'),
    creator: presentCreator(input.creator),
    category: truncateText(input.category, 28, 'Featured'),
    duration: /^\d{1,2}:\d{2}$/.test(cleanText(input.duration)) && input.duration !== '00:00' ? input.duration : '',
    description: truncateText(input.description, 260, 'A new entry on the HOTRANK chart.'),
    why: truncateText(input.why, 220, 'This clip is gathering attention on the live chart.'),
    saves: safeCount(input.saves),
    shares: safeCount(input.shares),
    views: safeCount(input.views),
    change: Number.isFinite(Number(input.change)) && Number(input.change) > 0 ? Number(input.change) : 0,
  };
}
