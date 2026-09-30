import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DestinationCard from './DestinationCard';

const DestinationRail = ({ title, destinations }) => {
  const railRef = useRef(null);
  const dragState = useRef(null);
  const suppressClick = useRef(false);

  const scrollByCards = (direction) => {
    if (!railRef.current) return;
    const card = railRef.current.querySelector('[data-destination-card]');
    const cardWidth = card?.getBoundingClientRect().width || 350;
    railRef.current.scrollBy({ left: direction * (cardWidth + 24) * 2, behavior: 'smooth' });
  };

  const handlePointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button, a')) return;
    dragState.current = { x: event.clientX, scrollLeft: railRef.current.scrollLeft, moved: false };
    railRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragState.current || !railRef.current) return;
    const delta = event.clientX - dragState.current.x;
    if (Math.abs(delta) > 5) dragState.current.moved = true;
    if (dragState.current.moved) railRef.current.scrollLeft = dragState.current.scrollLeft - delta;
  };

  const finishDrag = () => {
    if (dragState.current?.moved) {
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 0);
    }
    dragState.current = null;
  };

  return (
    <section className="space-y-4" aria-label={title}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{destinations.length} destinations</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => scrollByCards(-1)} aria-label={`Scroll ${title} left`} className="w-10 h-10 grid place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700"><ChevronLeft className="w-5 h-5" /></button>
          <button type="button" onClick={() => scrollByCards(1)} aria-label={`Scroll ${title} right`} className="w-10 h-10 grid place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      <div
        ref={railRef}
        className="destination-rail flex gap-6 overflow-x-auto scroll-smooth pb-5 select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {destinations.map((destination) => (
          <div data-destination-card key={destination._id} className="destination-rail-card shrink-0">
            <DestinationCard destination={destination} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default DestinationRail;
