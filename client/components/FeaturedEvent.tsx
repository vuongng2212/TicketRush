'use client';

import { formatVND } from '@/lib/design-tokens';
import type { EditorialEvent } from './EventRow';

interface FeaturedRowProps {
  event: EditorialEvent;
  onSelect?: (eventId: string) => void;
}

/**
 * Editorial Featured Event — large 2-col card-style but with text-dominant
 * - Photo left (or right), text right
 * - No rounded, no glow, no chrome
 */
export const FeaturedEvent = ({ event, onSelect }: FeaturedRowProps) => {
  const isSoldOut = event.ticketStatus === 'SOLD_OUT';

  return (
    <button
      type="button"
      onClick={() => onSelect?.(event.id)}
      className="w-full grid grid-cols-1 lg:grid-cols-2 text-left border-b border-hairline hover:bg-paper hover:text-ink group transition-none"
      aria-label={`Featured: ${event.title}`}
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[480px] bg-ink-2 overflow-hidden">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-end p-8 bg-gradient-to-br from-ink-2 to-ink">
            <p className="font-mono text-label uppercase text-muted tracking-[0.2em]">
              [ảnh concert]
            </p>
          </div>
        )}
        {isSoldOut && (
          <div className="absolute top-4 left-4 bg-ink text-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider">
            Đã hết vé
          </div>
        )}
      </div>

      {/* Text */}
      <div className="p-8 lg:p-12 flex flex-col justify-between min-h-[480px]">
        <div>
          <p className="font-mono text-label uppercase text-coral group-hover:text-ink tracking-[0.2em] mb-4">
            Featured · {event.city}
          </p>
          <h3
            className="font-display uppercase text-paper group-hover:text-ink leading-[0.95] tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(40px, 5vw, 72px)',
              fontWeight: 400,
            }}
          >
            {event.title}
          </h3>
          <p className="mt-6 font-body text-body text-muted group-hover:text-ink max-w-md">
            {event.artist} · {event.venue}
          </p>
        </div>
        <div className="mt-8 flex items-baseline justify-between">
          <span className="font-mono text-body text-paper group-hover:text-ink">
            Từ {formatVND(event.minPrice)}
          </span>
          <span className="font-label uppercase text-coral group-hover:text-ink tracking-[0.2em] text-label">
            Mua vé →
          </span>
        </div>
      </div>
    </button>
  );
};

export default FeaturedEvent;
