export default function PlayerFilter({ items, selected, onChange }) {
  const players = ['All', ...new Set(items.map(i => i.player))];

  return (
    <div className="player-filter" role="group" aria-label="Filter by player">
      {players.map(player => (
        <button
          key={player}
          className={`filter-pill${selected === player ? ' active' : ''}`}
          onClick={() => onChange(player)}
        >
          {player}
        </button>
      ))}
    </div>
  );
}
