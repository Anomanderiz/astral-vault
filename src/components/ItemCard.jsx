import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import RarityBadge, { RARITY_COLORS } from './RarityBadge';

export default function ItemCard({ item }) {
  const [flipped, setFlipped] = useState(false);

  const rarityColor = RARITY_COLORS[item.rarity] || '#aaaaaa';
  const faceStyle = {
    border: `1.5px solid ${rarityColor}`,
    boxShadow: `0 0 16px rgba(0,0,0,0.7), 0 0 24px ${rarityColor}33`,
  };

  const properties = Array.isArray(item.properties) ? item.properties : [];

  return (
    <div
      className={`card-wrapper${flipped ? ' flipped' : ''}`}
      onClick={() => setFlipped(f => !f)}
    >
      {/* Front */}
      <div className="card-face card-front" style={faceStyle}>
        <div className="card-header">
          <h2 className="card-name">{item.name}</h2>
        </div>

        <div className="card-type-line">
          {item.item_type}
          {item.requires_attunement && (
            <em>
              {' · '}Requires Attunement
              {item.attunement_condition ? ` (${item.attunement_condition})` : ''}
            </em>
          )}
        </div>

        <div className="card-rarity-row">
          <RarityBadge rarity={item.rarity} />
        </div>

        <div className="card-divider">
          <svg viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="0" y1="6" x2="88" y2="6" stroke="#c9a84c" strokeWidth="1" />
            <polygon points="100,0 108,6 100,12 92,6" fill="#c9a84c" />
            <line x1="112" y1="6" x2="200" y2="6" stroke="#c9a84c" strokeWidth="1" />
          </svg>
        </div>

        <div className="card-properties">
          {properties.map((prop, idx) => (
            <span key={idx} className="property-chip">{prop.name}</span>
          ))}
        </div>

        <div className="card-owner">
          {item.character && <span>{item.character}</span>}
          {item.character && item.player && ' · '}
          <span>{item.player}</span>
        </div>
      </div>

      {/* Back */}
      <div className="card-face card-back" style={faceStyle}>
        <button
          className="flip-back-btn"
          aria-label="Flip back"
          onClick={e => { e.stopPropagation(); setFlipped(false); }}
        >
          ↩
        </button>
        <div className="card-description">
          <ReactMarkdown>{item.description}</ReactMarkdown>
        </div>
        {item.flavour_text && (
          <>
            <div className="back-divider" />
            <p className="flavour-text">{item.flavour_text}</p>
          </>
        )}
      </div>
    </div>
  );
}
