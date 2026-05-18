import { useState, useRef, useCallback, useEffect } from 'react';
import ItemCard from './ItemCard';

const GAP = 80;
const MIN_RADIUS = 440;
const DRAG_THRESHOLD = 8;

function getCardWidth() {
  return window.innerWidth < 768 ? 220 : 360;
}

function normalizeAngle(a) {
  return ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

export default function Rolodex({ items, hiding }) {
  const [rotation, setRotation] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const rotationRef = useRef(0);
  const dragRef = useRef({ startX: null, startRotation: 0, dragging: false });

  const N = items.length;
  const cardW = getCardWidth();
  const angle = N > 1 ? (2 * Math.PI) / N : 0;
  const calcRadius = N > 1 ? (cardW + GAP) / (2 * Math.tan(angle / 2)) : 0;
  const radius = Math.max(calcRadius, MIN_RADIUS);

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

  // No setPointerCapture — that swallows click events on buttons and cards.
  // Use a movement threshold so taps fire click normally; only dragging triggers rotation.
  const onPointerDown = useCallback((e) => {
    if (N <= 1) return;
    if (e.target.closest('button')) return;
    dragRef.current = { startX: e.clientX, startRotation: rotationRef.current, dragging: false };
  }, [N]);

  const onPointerMove = useCallback((e) => {
    const { startX, startRotation } = dragRef.current;
    if (startX === null) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > DRAG_THRESHOLD) dragRef.current.dragging = true;
    if (!dragRef.current.dragging) return;
    setSnapping(false);
    const newRot = startRotation + delta / radius;
    rotationRef.current = newRot;
    setRotation(newRot);
  }, [radius]);

  const onPointerUp = useCallback(() => {
    if (dragRef.current.dragging) snap(rotationRef.current);
    dragRef.current = { startX: null, startRotation: 0, dragging: false };
  }, [snap]);

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

  return (
    <div
      className={`carousel-scene${hiding ? ' cards-hiding' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
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
          if (steps < 0.5)       { opacity = 1;    scale = 1.05; }
          else if (steps < 1.5)  { opacity = 0.75; }

          return (
            <div
              key={item.id}
              className="carousel-card"
              style={{
                transform: `rotateY(${i * angle}rad) translateZ(${radius}px) scale(${scale})`,
                opacity,
                transition: snapping
                  ? 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
                  : 'none',
              }}
            >
              <ItemCard item={item} />
            </div>
          );
        })}
      </div>

      <button className="carousel-btn next desktop-only" onClick={goNext} aria-label="Next">→</button>

      <div className="carousel-nav-mobile">
        <button className="carousel-btn" onClick={goPrev} aria-label="Previous">←</button>
        <span>·</span>
        <button className="carousel-btn" onClick={goNext} aria-label="Next">→</button>
      </div>
    </div>
  );
}
