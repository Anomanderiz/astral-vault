const RARITY_COLORS = {
  common: '#aaaaaa',
  uncommon: '#2dc46e',
  rare: '#4a90d9',
  'very rare': '#9b59b6',
  legendary: '#e67e22',
  artifact: '#e74c3c',
};

export { RARITY_COLORS };

export default function RarityBadge({ rarity }) {
  const bg = RARITY_COLORS[rarity] || '#aaaaaa';
  return (
    <span
      className="rarity-badge"
      style={{ backgroundColor: bg }}
    >
      {rarity}
    </span>
  );
}
