const colorMap = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  white: 'bg-white border border-slate-300',
  pink: 'bg-pink-400',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
};

export default function ColorBadge({ color, size = 'md' }) {
  const sz = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <span
      className={`inline-block rounded-full ${sz} ${colorMap[color] || 'bg-slate-400'}`}
      title={color}
    />
  );
}
