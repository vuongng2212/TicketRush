'use client';

import { formatTime, formatDayOfWeek, formatShortDate, formatVND } from '@/lib/design-tokens';

export interface EditorialEvent {
  id: string;
  title: string;
  artist: string;
  venue: string;
  startTime: string;        // ISO
  minPrice: number;
  availableSeats: number;
  imageUrl?: string;
  ticketStatus: 'ON_SALE' | 'SOLD_OUT' | 'COMING_SOON';
  city: string;
}

interface EventRowProps {
  event: EditorialEvent;
  onSelect?: (eventId: string) => void;
  index: number;
}

/**
 * Editorial event row — TEXT ROW, not card
 * - 1px hairline divider between rows
 * - Hover: instant full invert
 * - Date 16px Bebas (boldest)
 * - Title 24px, venue 14px
 * - Price + status right
 */
export const EventRow = ({ event, onSelect, index }: EventRowProps) => {
  const isSoldOut = event.ticketStatus === 'SOLD_OUT';
  const isComingSoon = event.ticketStatus === 'COMING_SOON';

  const statusLabel = isSoldOut
    ? 'Đã hết vé'
    : isComingSoon
      ? 'Sắp mở bán'
      : 'Còn vé';

  const statusColor = isSoldOut
    ? 'text-muted'
    : isComingSoon
      ? 'text-paper'
      : 'text-coral';

  return (
    <button
      type="button"
      onClick={() => onSelect?.(event.id)}
      className={[
        'group block w-full text-left',
        'border-b border-hairline',
        'hover:bg-paper hover:text-ink',
        'transition-none',
        'focus:outline-none focus:bg-paper focus:text-ink',
      ].join(' ')}
      aria-label={`${event.artist} - ${event.title} tại ${event.venue}`}
    >
      <div className="grid grid-cols-12 gap-4 items-baseline px-6 lg:px-12 py-6 lg:py-8">
        {/* Index number — small mono */}
        <div className="hidden lg:block col-span-1 font-mono text-small text-muted group-hover:text-ink">
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Date + time — boldest element */}
        <div className="col-span-3 lg:col-span-2 font-display text-coral group-hover:text-ink text-[20px] lg:text-[24px] leading-none uppercase tracking-[-0.01em]">
          {formatDayOfWeek(event.startTime)} {formatShortDate(event.startTime)}
          <div className="font-mono text-small text-muted group-hover:text-ink mt-1">
            {formatTime(event.startTime)}
          </div>
        </div>

        {/* Title + artist + venue */}
        <div className="col-span-9 lg:col-span-6">
          <h3 className="font-display uppercase text-paper group-hover:text-ink text-[24px] lg:text-[32px] leading-[1.0] tracking-[-0.01em]">
            {event.title}
          </h3>
          <p className="mt-2 font-body text-small text-muted group-hover:text-ink">
            {event.artist} · {event.venue} · {event.city}
          </p>
        </div>

        {/* Price + status — right aligned */}
        <div className="col-span-12 lg:col-span-3 flex flex-row lg:flex-col items-baseline lg:items-end justify-between lg:justify-end gap-2 mt-2 lg:mt-0">
          <span className="font-mono text-paper group-hover:text-ink text-[16px] lg:text-[18px]">
            {formatVND(event.minPrice)}
          </span>
          <span
            className={[
              'font-label uppercase text-label tracking-[0.15em]',
              statusColor,
              'group-hover:text-ink',
            ].join(' ')}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </button>
  );
};

export default EventRow;
