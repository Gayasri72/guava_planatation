import { usePalette } from './Palette.jsx';

export default function ColorBadge({ color, size = 'md' }) {
  const { hexFor } = usePalette();
  const sz = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <span
      className={`inline-block rounded-full border border-black/10 ${sz}`}
      style={{ backgroundColor: hexFor(color) }}
      title={color}
    />
  );
}
