// Built-in palette used as a fallback before settings load (and for unknown colors).
export const DEFAULT_PALETTE = [
  { name: 'red', hex: '#ef4444' },
  { name: 'yellow', hex: '#facc15' },
  { name: 'blue', hex: '#3b82f6' },
  { name: 'green', hex: '#22c55e' },
  { name: 'white', hex: '#ffffff' },
  { name: 'pink', hex: '#f472b6' },
  { name: 'orange', hex: '#f97316' },
  { name: 'purple', hex: '#a855f7' },
];

export const FALLBACK_HEX = '#94a3b8'; // slate-400 for unknown colors

// Returns black or white text that stays readable on the given background hex.
export function textOn(hex) {
  const c = (hex || '').replace('#', '');
  if (c.length !== 6) return '#1e293b';
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1e293b' : '#ffffff';
}

// Accepts the palette from settings, which may be {name,hex} objects or (legacy)
// plain strings, and normalizes to {name,hex}.
export function normalizePalette(list) {
  const fallback = Object.fromEntries(DEFAULT_PALETTE.map((c) => [c.name, c.hex]));
  return (list || [])
    .map((c) =>
      typeof c === 'string'
        ? { name: c, hex: fallback[c] || FALLBACK_HEX }
        : { name: c.name, hex: c.hex || fallback[c.name] || FALLBACK_HEX }
    )
    .filter((c) => c.name);
}
