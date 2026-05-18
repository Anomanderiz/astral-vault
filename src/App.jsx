import { useState } from 'react';
import StarField from './components/StarField';
import PlayerFilter from './components/PlayerFilter';
import Rolodex from './components/Rolodex';
import { useItems } from './hooks/useItems';

function LoadingState() {
  return (
    <div className="loading-state" aria-label="Loading">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="loading-dot" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
}

export default function App() {
  const { items, loading, error } = useItems();
  const [selectedPlayer, setSelectedPlayer] = useState('All');
  const [hiding, setHiding] = useState(false);

  const filteredItems = selectedPlayer === 'All'
    ? items
    : items.filter(item => item.player === selectedPlayer);

  const handleFilterChange = (player) => {
    if (player === selectedPlayer) return;
    setHiding(true);
    setTimeout(() => {
      setSelectedPlayer(player);
      setHiding(false);
    }, 200);
  };

  return (
    <div className="app">
      <StarField />
      <div className="ui-layer">
        <header>
          <h1>The Vault</h1>
          <p>Artefacts of Power</p>
        </header>

        {!loading && items.length > 0 && (
          <PlayerFilter
            items={items}
            selected={selectedPlayer}
            onChange={handleFilterChange}
          />
        )}

        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="empty-vault">
            <p>The Vault door remains sealed. Check your Supabase connection.</p>
          </div>
        ) : (
          <Rolodex items={filteredItems} hiding={hiding} />
        )}
      </div>
    </div>
  );
}
