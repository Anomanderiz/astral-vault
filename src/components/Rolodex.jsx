import { useState, useRef, useCallback, useEffect } from 'react';
import ItemCard from './ItemCard';

const GAP = 60;

function getCardDimensions() {
  const isMobile = window.innerWidth < 768;
  return { w: isMobile ? 220 : 280, h: isMobile ? 340 : 420 };
}

function normalizeAngle(a) {
  return ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

export default function Rolodex({ items, hiding }) {
  const [rotation, setRotation] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const rotationRef = useRef(0);
  const dragRef = useRef({ active: false, startX: 0, startRotation: 0 });

  const N = items.length;
  const { w: cardW } = getCardDimensions();
  const angle = N > 1 ? (2 * Math.PI) / N : 0;
  const radius = N > 1 ? (cardW + GAP) / (2 * Math.tan(angle / 2)) : 0;

  // Reset carousel position when item list changes
  useEffect(() => {
    setRotation(0);
    rotationRef.current = 0;
    setSnapping(false);
  }, [N]);

  const snap = useCallback((rot) => {
    if (N <= 1) return;
    const snapped = Math.round(rot / angle) * angle;
    rotationRef.current = snapped;
    setRotation(snapped);
    setSnapping(true);
  }, [angle, N]);

  const goNext = useCallback(() => {
    const next = rotationRef.current - angle;
    rotationRef.current = next;
    setRotation(next);
    setSnapping(true);
  }, [angle]);

  const goPrev = useCallback(() => {
    const prev = rotationRef.current + angle;
    rotationRef.current = prev;
    setRotation(prev);
    setSnapping(true);
  }, [angle]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const onPointerDown = (e) => {
    if (N <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { active: true, startX: e.clientX, startRotation: rotationRef.current };
    setSnapping(false);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const delta = e.clientX - dragRef.current.startX;
    const newRot = dragRef.current.startRotation + delta / radius;
    rotationRef.current = newRot;
    setRotation(newRot);
  };

  const onPointerUp = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    snap(rotationRef.current);
  };

  // ── Edge cases ─────────────────────────────────────────────────────────────

  if (N === 0) {
    return (
      <div className="empty-vault">
        <p>The Vault stirs… but holds no artefacts matching this search.</p>
      </div>
    );
  }

  if (N === 1) {
    return (
      <div className="single-item">
        <ItemCard item={items[0]} />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className={`carousel-scene${hiding ? ' cards-hiding' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Desktop arrows */}
      <button className="carousel-btn prev desktop-only" onClick={goPrev} aria-label="Previous">←</button>

      <div
        className="carousel-inner"
        style={{
          transform: `rotateY(${rotation}rad)`,
          transition: snapping ? 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none',
        }}
      >
        {items.map((item, i) => {
          const worldAngle = normalizeAngle(i * angle + rotation);
          const distFromFront = worldAngle > Math.PI ? 2 * Math.PI - worldAngle : worldAngle;
          const steps = distFromFront / angle;

          let opacity = 0.45;
          let scale = 1;
          if (steps < 0.5) { opacity = 1; scale = 1.06; }
          else if (steps < 1.5) { opacity = 0.75; }

          return (
            <div
              key={item.id}
              className="carousel-card"
              style={{
                transform: `rotateY(${i * angle}rad) translateZ(${radius}px) scale(${scale})`,
                opacity,
                transition: snapping ? 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none',
              }}
            >
              <ItemCard item={item} />
            </div>
          );
        })}
      </div>

      <button className="carousel-btn next desktop-only" onClick={goNext} aria-label="Next">→</button>

      {/* Mobile nav row */}
      <div className="carousel-nav-mobile">
        <button className="carousel-btn" onClick={goPrev} aria-label="Previous">←</button>
        <span>·</span>
        <button className="carousel-btn" onClick={goNext} aria-label="Next">→</button>
      </div>
    </div>
  );
}
